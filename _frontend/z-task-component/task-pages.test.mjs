import {after, test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {transformWithEsbuild} from 'vite'
import axios from 'axios'
import dayjs from 'dayjs'
import {resolvePath} from 'react-router-dom'

const root = path.dirname(fileURLToPath(import.meta.url))
const originalStorage = globalThis.localStorage
const storage = new Map([['userId', 'user-7'], ['token', 'mock-token']])
globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
}
after(() => { globalThis.localStorage = originalStorage })

// Compile the actual source in memory. No browser, install, generated files, or backend traffic.
const compiled = new Map()
async function load(relative, dependencies) {
    const filename = path.join(root, relative)
    if (!compiled.has(filename)) {
        const source = await readFile(filename, 'utf8')
        const result = await transformWithEsbuild(source, filename, {
            loader: filename.endsWith('jsx') ? 'jsx' : 'js', format: 'cjs', jsx: 'automatic',
        })
        compiled.set(filename, result.code)
    }
    const module = {exports: {}}
    new Function('require', 'module', 'exports', compiled.get(filename))(name => {
        assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
        return dependencies[name]
    }, module, module.exports)
    return module.exports
}

async function apiFixture(respond = () => []) {
    const common = await load('node_modules/@yuku123/z-frontend-common/src/services/request.js', {
        axios, antd: {message: {}},
    })
    const requestModule = await load('src/services/request.js', {'@yuku123/z-frontend-common': common})
    const request = requestModule.default
    const calls = []
    // A real axios instance + the installed shared interceptors, with a local adapter only.
    request.defaults.adapter = async config => {
        const call = {
            method: config.method, url: request.getUri(config), endpoint: config.url,
            params: config.params, data: config.data ? JSON.parse(config.data) : null,
            headers: config.headers,
        }
        calls.push(call)
        const data = await respond(call)
        return {data, status: 200, statusText: 'OK', headers: {}, config}
    }
    const api = await load('src/services/api.js', {'./request': requestModule})
    return {...requestModule, api, calls}
}
const ok = data => ({code: 200, data})

function deferred() {
    let resolve, reject
    const promise = new Promise((yes, no) => { resolve = yes; reject = no })
    return {promise, resolve, reject}
}

// Small hook host: executes real page effects/handlers with mocked antd and router boundaries.
// This tests async control flow; it deliberately does not claim DOM/layout or antd validation coverage.
async function pageFixture(relative, api, {id = 'new', search = ''} = {}) {
    const slots = []
    let cursor = 0, dirty = false, tree, component, props, effects = []
    const navigations = [], successes = [], errors = []
    const values = {status: 0, priority: 1}
    const form = {
        setFieldValue: (key, value) => { values[key] = value },
        validateFields: async () => ({...values}),
        resetFields: () => { for (const key of Object.keys(values)) delete values[key] },
    }
    const equalDeps = (a, b) => a && b && a.length === b.length && a.every((item, i) => Object.is(item, b[i]))
    const react = {
        useState(initial) {
            const index = cursor++
            if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
            return [slots[index], next => {
                slots[index] = typeof next === 'function' ? next(slots[index]) : next
                dirty = true
            }]
        },
        useRef(initial) {
            const index = cursor++
            if (!(index in slots)) slots[index] = {current: initial}
            return slots[index]
        },
        useCallback(fn, deps) {
            const index = cursor++
            if (!equalDeps(slots[index]?.deps, deps)) slots[index] = {fn, deps}
            return slots[index].fn
        },
        useEffect(fn, deps) {
            const index = cursor++
            if (!equalDeps(slots[index]?.deps, deps)) {
                const previous = slots[index]
                slots[index] = {deps}
                effects.push(() => {
                    previous?.cleanup?.()
                    slots[index].cleanup = fn()
                })
            }
        },
    }
    const Form = Object.assign(() => {}, {useForm: () => [form], Item: 'Form.Item'})
    const antd = Object.fromEntries(['Alert', 'Button', 'Card', 'DatePicker', 'Descriptions', 'Select', 'Space', 'Spin', 'Tag', 'Modal', 'Col', 'Row', 'Statistic'].map(name => [name, name]))
    Object.assign(antd, {
        Form, Input: Object.assign(() => {}, {TextArea: 'Input.TextArea'}),
        message: {success: text => successes.push(text), error: text => errors.push(text)},
    })
    const jsx = (type, props, key) => ({type, props: props || {}, key})
    const module = await load(relative, {
        react, 'react/jsx-runtime': {jsx, jsxs: jsx, Fragment: 'Fragment'}, antd,
        'react-router-dom': {
            useNavigate: () => (...args) => navigations.push(args),
            useParams: () => ({id}), useSearchParams: () => [new URLSearchParams(search)],
        },
        '../../services/api': api, '../services/api': api,
        '@ant-design/icons': {PlusOutlined: 'PlusOutlined', CheckCircleOutlined: 'CheckCircleOutlined', ClockCircleOutlined: 'ClockCircleOutlined', FileTextOutlined: 'FileTextOutlined'},
        '@yuku123/z-frontend-common/ui': {ListTable: 'ListTable'},
    })
    component = module.default
    props = {}
    if (relative.endsWith('TaskEdit.jsx')) {
        const child = component()
        component = child.type
        props = child.props
    }
    function render() {
        cursor = 0
        dirty = false
        tree = component(props)
        const pending = effects
        effects = []
        pending.forEach(effect => effect())
    }
    function all(type) {
        const matches = []
        function visit(node) {
            if (Array.isArray(node)) return node.forEach(visit)
            if (!node || typeof node !== 'object') return
            if (node.type === type || node.type?.name === type) matches.push(node)
            visit(node.props?.children)
        }
        visit(tree)
        return matches
    }
    async function flush() {
        for (let i = 0; i < 12; i++) {
            await new Promise(resolve => setImmediate(resolve))
            if (!dirty) return
            render()
        }
        assert.fail('Hook host did not settle')
    }
    render()
    return {
        all, flush, values, form, antd, navigations, successes, errors,
        field: name => all('Form.Item').find(node => node.props.name === name)?.props.children,
        button: text => all('Button').find(node => node.props.children === text),
        unmount: () => slots.forEach(slot => slot?.cleanup?.()),
    }
}

const taskEdit = 'src/pages/task/TaskEdit.jsx'
const project = {id: 10, name: '真实项目', status: 1}
const list = {id: 23, boardId: 20, boardName: '真实看板', name: '真实列表', projectId: 10}
const task = {id: 77, projectId: 10, boardId: 20, listId: 23, title: '真实任务', status: 0, priority: 1}
const createApi = overrides => ({
    getProjectListByUser: async () => [project], getTaskListsByProject: async () => [list],
    createTask: async () => task, ...overrides,
})
async function readyCreate(api = createApi()) {
    const page = await pageFixture(taskEdit, api)
    await page.flush()
    Object.assign(page.values, {projectId: 10, title: '  标题  ', description: '保留描述'})
    page.field('projectId').props.onChange(10)
    await page.flush()
    page.values.listId = 23
    return page
}
const submit = page => page.all(page.antd.Form)[0].props.onFinish({...page.values})

test('all service URLs are base-relative, params match controllers, and results are unwrapped', async () => {
    const fixture = await apiFixture(call => {
        if (call.endpoint === '/auth/login') return ok({token: 'token'})
        if (call.method === 'get') return ok([])
        if (call.endpoint === '/task' || call.endpoint === '/project') return ok({id: 77})
        return ok(true)
    })
    const {api, calls} = fixture
    assert.deepEqual(await api.login({username: 'test'}), {token: 'token'})
    assert.deepEqual(await api.getTaskListByList(23), [])
    await api.getTaskListByProject(10)
    await api.getTaskListByAssignee('user-7')
    assert.equal((await api.createTask({title: 'test'})).id, 77)
    await api.moveTask(77, 23, '2')
    await api.addTaskAssignee(77, 'user-7')
    await api.removeTaskAssignee(77, 'user-7')
    await api.completeTask(77)
    await api.reopenTask(77)
    await api.getProjectListByUser()
    await api.createProject({name: 'test'})
    await api.archiveProject(10)
    assert.deepEqual(calls.map(call => [call.method, call.endpoint]), [
        ['post', '/auth/login'], ['get', '/task/list'], ['get', '/task/project/list'],
        ['get', '/task/assignee/list'], ['post', '/task'], ['put', '/task/move'],
        ['post', '/task/assignees/add'], ['post', '/task/assignees/remove'],
        ['post', '/task/complete'], ['post', '/task/reopen'], ['get', '/project/user/list'],
        ['post', '/project'], ['put', '/project/archive'],
    ])
    assert.deepEqual(calls[5].params, {taskId: 77, targetListId: 23, position: '2'})
    assert.deepEqual(calls[12].params, {projectId: 10})
    assert.equal(calls[10].params, undefined)
    for (const call of calls) {
        assert.ok(call.url.startsWith('/api/'))
        assert.ok(!call.url.includes('/api/api/'))
        assert.equal(call.headers.Authorization, 'Bearer mock-token')
        assert.equal(call.headers['X-User-Id'], 'user-7')
    }
    fixture.configureTask({apiBase: '/embedded/task-api'})
    await api.getTaskListByList(23)
    assert.equal(calls.at(-1).url, '/embedded/task-api/task/list?listId=23')
    fixture.configureTask({apiBase: 'https://example.invalid/custom/api/'})
    await api.createTask({title: 'mock only'})
    assert.equal(calls.at(-1).url, 'https://example.invalid/custom/api/task')
})

test('services reject business failure, false actions, invalid lists, and missing created IDs', async () => {
    let response = ok(false)
    const {api} = await apiFixture(() => response)
    for (const action of [api.completeTask, api.reopenTask, api.archiveProject]) {
        await assert.rejects(action(77), /操作未成功/)
    }
    response = {code: 403, data: null, message: '无权限'}
    await assert.rejects(api.createTask({}), /无权限/)
    response = ok(null)
    await assert.rejects(api.createTask({}), /缺少 ID/)
    await assert.rejects(api.createProject({}), /缺少 ID/)
    response = ok({data: []})
    await assert.rejects(api.getProjectListByUser(), /格式错误/)
})

test('project lists load via boards with board identity and archived lists excluded', async () => {
    const {api, calls} = await apiFixture(call => {
        if (call.endpoint === '/board/project') return ok([{id: 20, name: 'A'}, {id: 21, name: 'B'}])
        return ok(call.params.boardId === 20
            ? [{id: 23, name: '列表', isArchived: 0}, {id: 24, isArchived: 1}]
            : [{id: 25, name: '列表二', isArchived: 0}])
    })
    const lists = await api.getTaskListsByProject(10)
    assert.deepEqual(lists.map(item => [item.id, item.boardId, item.projectId]), [[23, 20, 10], [25, 21, 10]])
    assert.equal(calls[0].url, '/api/board/project?projectId=10')
    assert.equal(calls[1].url, '/api/task-list/board?boardId=20')
})

test('detail uses supported list reads for context and direct links, never invented endpoints', async () => {
    const {api, calls} = await apiFixture(call => {
        if (call.endpoint === '/project/user/list') return ok([{id: 9}, project])
        return ok(call.params?.projectId === 9 ? [] : [task])
    })
    assert.deepEqual(await api.getTaskDetail('77', {projectId: '10'}), task)
    assert.equal(calls.length, 1)
    assert.deepEqual(await api.getTaskDetail(77, {listId: 23}), task)
    assert.deepEqual(await api.getTaskDetail(77), task)
    await assert.rejects(api.getTaskDetail(78), /未找到任务/)
    assert.ok(calls.every(call => ['/task/list', '/task/project/list', '/project/user/list'].includes(call.endpoint)))
})

test('creation loads real choices, formats LocalDate, includes boardId, and only then navigates', async () => {
    const pending = deferred()
    const payloads = []
    const page = await readyCreate(createApi({createTask: payload => { payloads.push(payload); return pending.promise }}))
    assert.deepEqual(page.field('projectId').props.options, [{value: 10, label: '真实项目'}])
    assert.deepEqual(page.field('listId').props.options, [{value: 23, label: '真实看板 / 真实列表'}])
    page.values.dueDate = dayjs('2026-11-30')
    const first = submit(page)
    await submit(page) // Same-turn double submit must be stopped before a render.
    await page.flush()
    assert.equal(payloads.length, 1)
    assert.deepEqual(payloads[0], {
        title: '标题', description: '保留描述', projectId: 10, boardId: 20, listId: 23,
        priority: 1, status: 0, dueDate: '2026-11-30',
    })
    assert.equal(page.button('创建').props.loading, true)
    assert.equal(page.all(page.antd.Form)[0].props.disabled, true)
    assert.equal(page.successes.length, 0)
    assert.equal(page.navigations.length, 0)
    pending.resolve(task)
    await first
    await page.flush()
    assert.deepEqual(page.successes, ['任务创建成功'])
    assert.deepEqual(page.navigations, [['../..', {relative: 'path'}]])
})

test('failed creation retains every input, shows an error, and allows a successful retry', async () => {
    let attempts = 0
    const page = await readyCreate(createApi({createTask: async () => {
        if (++attempts === 1) throw new Error('创建失败（mock）')
        return task
    }}))
    const before = {...page.values}
    await submit(page)
    await page.flush()
    assert.deepEqual(page.values, before)
    assert.deepEqual(page.successes, [])
    assert.deepEqual(page.navigations, [])
    assert.ok(page.all('Alert').some(node => node.props.title === '创建失败（mock）'))
    assert.equal(page.button('创建').props.loading, false)
    await submit(page)
    assert.equal(attempts, 2)
    assert.equal(page.successes.length, 1)
})

test('project failure/loading and list failure have working retries without erasing text', async () => {
    let projectCalls = 0, listCalls = 0
    const page = await pageFixture(taskEdit, createApi({
        getProjectListByUser: async () => {
            if (++projectCalls === 1) throw new Error('项目失败')
            return [project]
        },
        getTaskListsByProject: async () => {
            if (++listCalls === 1) throw new Error('列表失败')
            return [list]
        },
    }))
    assert.equal(page.field('projectId').props.loading, true)
    await page.flush()
    page.values.title = '未丢失的输入'
    assert.equal(page.all('LoadError')[0].props.text, '项目失败')
    await page.all('LoadError')[0].props.onRetry()
    await page.flush()
    page.values.projectId = 10
    page.field('projectId').props.onChange(10)
    await page.flush()
    assert.equal(page.all('LoadError')[0].props.text, '列表失败')
    await page.all('LoadError')[0].props.onRetry()
    await page.flush()
    assert.equal(page.values.title, '未丢失的输入')
    assert.equal(page.field('listId').props.options.length, 1)
})

test('switching/clearing project immediately clears list selection and discards stale results/errors', async () => {
    const old = deferred(), current = deferred(), cleared = deferred()
    const page = await pageFixture(taskEdit, createApi({
        getTaskListsByProject: id => ({10: old, 11: current, 12: cleared}[id].promise),
    }))
    await page.flush()
    page.values.listId = 999
    page.field('projectId').props.onChange(10)
    assert.equal(page.values.listId, undefined)
    page.field('projectId').props.onChange(11)
    current.resolve([{...list, id: 30, projectId: 11}])
    await page.flush()
    old.reject(new Error('过期错误'))
    await page.flush()
    assert.equal(page.all('LoadError').length, 0)
    assert.equal(page.field('listId').props.options[0].value, 30)
    page.field('projectId').props.onChange(12)
    page.field('projectId').props.onChange(undefined)
    cleared.resolve([list])
    await page.flush()
    assert.deepEqual(page.field('listId').props.options, [])
    assert.equal(page.field('listId').props.disabled, true)
    assert.equal(page.field('listId').props.loading, false)
})

test('an old project success cannot overwrite the latest project lists', async () => {
    const old = deferred(), current = deferred()
    const page = await pageFixture(taskEdit, createApi({getTaskListsByProject: id => id === 10 ? old.promise : current.promise}))
    await page.flush()
    page.field('projectId').props.onChange(10)
    page.field('projectId').props.onChange(11)
    current.resolve([{...list, id: 30, projectId: 11}])
    await page.flush()
    old.resolve([list])
    await page.flush()
    assert.equal(page.field('listId').props.options[0].value, 30)
})

test('mismatched selection cannot create, and empty project/list states do not permit submission', async () => {
    let calls = 0
    const page = await readyCreate(createApi({createTask: async () => { calls++; return task }}))
    page.values.projectId = 99
    await submit(page)
    assert.equal(calls, 0)
    const empty = await pageFixture(taskEdit, createApi({getProjectListByUser: async () => []}))
    await empty.flush()
    assert.equal(empty.button('创建').props.disabled, true)
    assert.ok(empty.all('Alert').some(node => node.props.title.includes('暂无可用项目')))
})

test('late create response after leaving does not show success or navigate', async () => {
    const pending = deferred()
    const page = await readyCreate(createApi({createTask: () => pending.promise}))
    const request = submit(page)
    page.unmount()
    pending.resolve(task)
    await request
    assert.equal(page.successes.length, 0)
    assert.equal(page.navigations.length, 0)
})

test('optional-id route is creation and relative navigation preserves an embedded router base', async () => {
    const page = await pageFixture(taskEdit, createApi(), {id: null})
    await page.flush()
    page.button('取消').props.onClick()
    assert.deepEqual(page.navigations, [['..', {relative: 'path'}]])
    assert.equal(resolvePath('../..', '/host/custom/task/edit/new').pathname, '/host/custom/task')
    assert.equal(resolvePath('..', '/host/custom/task/edit').pathname, '/host/custom/task')
    assert.equal(resolvePath('edit/new', '/host/custom/task').pathname, '/host/custom/task/edit/new')
})

test('details are read-only real data, retry failed reads, and prevent duplicate complete/reopen actions', async () => {
    let reads = 0, completes = 0, reopens = 0
    const pending = deferred()
    const page = await pageFixture(taskEdit, {
        getTaskDetail: async (id, context) => {
            assert.equal(id, '77')
            assert.equal(context.projectId, '10')
            if (++reads === 1) throw new Error('详情加载失败')
            return {...task, status: completes ? 2 : 0}
        },
        completeTask: () => { completes++; return pending.promise },
        reopenTask: async () => { reopens++; throw new Error('操作未成功') },
    }, {id: '77', search: '?projectId=10'})
    await page.flush()
    assert.equal(page.all('LoadError')[0].props.text, '详情加载失败')
    await page.all('LoadError')[0].props.onRetry()
    await page.flush()
    assert.equal(page.all(page.antd.Form).length, 0)
    assert.equal(page.all('Descriptions')[0].props.items.find(item => item.key === 'title').children, '真实任务')
    const action = page.button('完成任务').props.onClick
    const request = action()
    await action()
    assert.equal(completes, 1)
    assert.equal(page.successes.length, 0)
    pending.resolve(true)
    await request
    await page.flush()
    assert.ok(page.button('重新打开'))
    await page.button('重新打开').props.onClick()
    await page.flush()
    assert.equal(reopens, 1)
    assert.deepEqual(page.successes, ['任务已完成'])
    assert.ok(page.all('Alert').some(node => node.props.title === '操作未成功'))
    assert.equal(page.navigations.length, 0)
})

test('all existing API consumers use unwrapped data and task links keep router context', async () => {
    const projects = await pageFixture('src/pages/project/ProjectList.jsx', {getProjectListByUser: async () => [project]})
    await projects.flush()
    assert.deepEqual(projects.all('ListTable')[0].props.rows, [project])
    const dashboard = await pageFixture('src/pages/Dashboard.jsx', {
        getTaskListByAssignee: async userId => {
            assert.equal(userId, 'user-7')
            return [task, {...task, id: 78, status: 2}]
        },
    })
    await dashboard.flush()
    assert.equal(dashboard.all('Statistic').find(node => node.props.title === '总任务数').props.value, 2)
    const tasks = await pageFixture('src/pages/task/TaskList.jsx', {
        getProjectListByUser: async () => [project],
        getTaskListByProject: async id => { assert.equal(id, 10); return [task] },
    })
    await tasks.flush()
    const table = tasks.all('ListTable')[0].props
    assert.deepEqual(table.rows, [task])
    table.cardExtra.props.onClick()
    const actions = table.columns.find(column => column.key === 'action').render(null, task)
    actions.props.children[0].props.onClick()
    assert.deepEqual(tasks.navigations, [['edit/new'], ['edit/77?projectId=10&listId=23']])
})
