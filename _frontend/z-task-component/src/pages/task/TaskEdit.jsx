import {useCallback, useEffect, useRef, useState} from 'react'
import {Alert, Button, Card, DatePicker, Descriptions, Form, Input, message, Select, Space, Spin} from 'antd'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {completeTask, createTask, getProjectListByUser, getTaskDetail, getTaskListsByProject, reopenTask} from '../../services/api'

const priorityOptions = [
    {value: 0, label: '低'},
    {value: 1, label: '中'},
    {value: 2, label: '高'},
    {value: 3, label: '紧急'}
]

const statusOptions = [
    {value: 0, label: '待办'},
    {value: 1, label: '进行中'},
    {value: 2, label: '已完成'}
]

const errorText = (error, fallback) => error?.response?.data?.message || error?.message || fallback

function LoadError({text, onRetry}) {
    return <Alert type="error" showIcon title={text} style={{marginBottom: 16}}
                  action={<Button size="small" onClick={onRetry}>重试</Button>}/>
}

function TaskCreate({onBack}) {
    const [form] = Form.useForm()
    const [projects, setProjects] = useState([])
    const [projectLoading, setProjectLoading] = useState(true)
    const [projectError, setProjectError] = useState('')
    const [projectId, setProjectId] = useState()
    const [lists, setLists] = useState([])
    const [listLoading, setListLoading] = useState(false)
    const [listError, setListError] = useState('')
    const [pending, setPending] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const projectRequest = useRef(0)
    const listRequest = useRef(0)
    const submitting = useRef(false)
    const mounted = useRef(false)

    const loadProjects = useCallback(async () => {
        const version = ++projectRequest.current
        setProjectLoading(true)
        setProjectError('')
        try {
            const data = await getProjectListByUser()
            if (version === projectRequest.current) setProjects(data.filter(project => Number(project.status) !== 0))
        } catch (error) {
            if (version === projectRequest.current) setProjectError(errorText(error, '加载项目失败'))
        } finally {
            if (version === projectRequest.current) setProjectLoading(false)
        }
    }, [])

    useEffect(() => {
        mounted.current = true
        loadProjects()
        return () => {
            mounted.current = false
            ++projectRequest.current
            ++listRequest.current
        }
    }, [loadProjects])

    const loadLists = async (value) => {
        // 立即失效旧请求（含清空项目、失败重试），不能等下一轮 effect。
        const version = ++listRequest.current
        setLists([])
        setListError('')
        setListLoading(value != null)
        if (value == null) return
        try {
            const data = await getTaskListsByProject(value)
            if (version === listRequest.current) setLists(data)
        } catch (error) {
            if (version === listRequest.current) setListError(errorText(error, '加载列表失败'))
        } finally {
            if (version === listRequest.current) setListLoading(false)
        }
    }

    const changeProject = (value) => {
        form.setFieldValue('listId', undefined)
        setProjectId(value)
        loadLists(value)
    }

    const onFinish = async (values) => {
        if (submitting.current || projectLoading || listLoading || projectError || listError) return
        const list = lists.find(item => String(item.id) === String(values.listId))
        if (!list || String(list.projectId) !== String(values.projectId) ||
            String(projectId) !== String(values.projectId)) {
            setSubmitError('请重新选择当前项目下的列表')
            return
        }
        submitting.current = true
        setPending(true)
        setSubmitError('')
        try {
            await createTask({
                title: values.title.trim(),
                description: values.description,
                projectId: values.projectId,
                boardId: list.boardId,
                listId: list.id,
                priority: values.priority,
                status: values.status,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
            })
            if (!mounted.current) return
            message.success('任务创建成功')
            onBack()
        } catch (error) {
            if (mounted.current) setSubmitError(errorText(error, '创建失败，请重试'))
        } finally {
            submitting.current = false
            if (mounted.current) setPending(false)
        }
    }

    return (
        <Card title="新建任务">
            {projectError && <LoadError text={projectError} onRetry={loadProjects}/>}
            {!projectLoading && !projectError && projects.length === 0 &&
                <Alert type="info" title="暂无可用项目，请先创建项目和列表" style={{marginBottom: 16}}/>}
            <Form form={form} layout="vertical" onFinish={onFinish} disabled={pending}
                  initialValues={{status: 0, priority: 1}}>
                <Form.Item name="title" label="任务名称"
                           rules={[{required: true, whitespace: true, message: '请输入任务名称'}]}>
                    <Input placeholder="请输入任务名称"/>
                </Form.Item>
                <Form.Item name="projectId" label="所属项目" rules={[{required: true, message: '请选择所属项目'}]}>
                    <Select placeholder="请选择项目" allowClear loading={projectLoading}
                            disabled={pending || projectLoading || !!projectError} onChange={changeProject}
                            options={projects.map(project => ({value: project.id, label: project.name}))}/>
                </Form.Item>
                {listError && <LoadError text={listError} onRetry={() => loadLists(projectId)}/>}
                <Form.Item name="listId" label="所属列表" rules={[{required: true, message: '请选择列表'}]}>
                    <Select placeholder={projectId == null ? '请先选择项目' : '请选择列表'} loading={listLoading}
                            disabled={pending || projectId == null || listLoading || !!listError}
                            notFoundContent="该项目暂无可用列表"
                            options={lists.map(list => ({value: list.id, label: `${list.boardName} / ${list.name}`}))}/>
                </Form.Item>
                <Form.Item name="priority" label="优先级"><Select options={priorityOptions}/></Form.Item>
                <Form.Item name="status" label="状态"><Select options={statusOptions}/></Form.Item>
                <Form.Item name="dueDate" label="截止日期"><DatePicker style={{width: '100%'}}/></Form.Item>
                <Form.Item name="description" label="任务描述"><Input.TextArea rows={4} placeholder="请输入任务描述"/></Form.Item>
                {submitError && <Alert type="error" showIcon title={submitError}
                                       description="输入已保留，请确认后重新点击创建。" style={{marginBottom: 16}}/>}
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={pending}
                                disabled={projectLoading || listLoading || !!projectError || !!listError || !lists.length}>创建</Button>
                        <Button onClick={onBack} disabled={pending}>取消</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    )
}

function TaskDetails({id, onBack}) {
    const [searchParams] = useSearchParams()
    const projectId = searchParams.get('projectId')
    const listId = searchParams.get('listId')
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [pending, setPending] = useState(false)
    const [actionError, setActionError] = useState('')
    const requestId = useRef(0)
    const submitting = useRef(false)
    const mounted = useRef(false)

    const loadTask = useCallback(async () => {
        const version = ++requestId.current
        setLoading(true)
        setError('')
        setTask(null)
        try {
            const data = await getTaskDetail(id, {projectId, listId})
            if (version === requestId.current) setTask(data)
        } catch (error) {
            if (version === requestId.current) setError(errorText(error, '加载任务失败'))
        } finally {
            if (version === requestId.current) setLoading(false)
        }
    }, [id, projectId, listId])

    useEffect(() => {
        mounted.current = true
        loadTask()
        return () => {
            mounted.current = false
            ++requestId.current
        }
    }, [loadTask])

    const changeStatus = async () => {
        if (submitting.current || !task) return
        submitting.current = true
        setPending(true)
        setActionError('')
        const completed = task.status === 2
        try {
            await (completed ? reopenTask(task.id) : completeTask(task.id))
            if (!mounted.current) return
            message.success(completed ? '任务已重新打开' : '任务已完成')
            await loadTask()
        } catch (error) {
            if (mounted.current) setActionError(errorText(error, '操作失败，请重试'))
        } finally {
            submitting.current = false
            if (mounted.current) setPending(false)
        }
    }

    return (
        <Card title="任务详情">
            <Alert type="info" showIcon title="任务字段只读：后端暂未提供通用更新接口，可完成或重新打开任务。"
                   style={{marginBottom: 16}}/>
            {loading && <Spin tip="加载任务中"><div style={{minHeight: 100}}/></Spin>}
            {error && <LoadError text={error} onRetry={loadTask}/>}
            {task && <>
                <Descriptions column={1} items={[
                    {key: 'id', label: 'ID', children: task.id},
                    {key: 'title', label: '任务名称', children: task.title},
                    {key: 'project', label: '所属项目 ID', children: task.projectId},
                    {key: 'board', label: '所属看板 ID', children: task.boardId ?? '-'},
                    {key: 'list', label: '所属列表 ID', children: task.listId},
                    {key: 'priority', label: '优先级', children: priorityOptions.find(option => option.value === task.priority)?.label || '-'},
                    {key: 'status', label: '状态', children: statusOptions.find(option => option.value === task.status)?.label || '-'},
                    {key: 'dueDate', label: '截止日期', children: task.dueDate || '-'},
                    {key: 'description', label: '任务描述', children: <div style={{whiteSpace: 'pre-wrap'}}>{task.description || '-'}</div>},
                ]}/>
                {actionError && <Alert type="error" showIcon title={actionError} style={{marginBottom: 16}}/>}
                <Button type="primary" loading={pending} onClick={changeStatus} style={{marginRight: 8}}>
                    {task.status === 2 ? '重新打开' : '完成任务'}
                </Button>
            </>}
            <Button onClick={onBack} disabled={pending}>返回任务列表</Button>
        </Card>
    )
}

export default function TaskEdit() {
    const navigate = useNavigate()
    const {id} = useParams()
    // 相对当前路径导航，保留宿主 routerBase / BrowserRouter basename，兼容无 id 的新建路由。
    const onBack = () => navigate(id ? '../..' : '..', {relative: 'path'})
    return id && id !== 'new'
        ? <TaskDetails key={id} id={id} onBack={onBack}/>
        : <TaskCreate key="new" onBack={onBack}/>
}
