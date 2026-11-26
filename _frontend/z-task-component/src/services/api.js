import request from './request'

// request 已解包 Result.data；所有路径都相对 configureTask({apiBase})，默认 /api。
const requireArray = (data) => {
    if (!Array.isArray(data)) throw new Error('列表响应格式错误')
    return data
}

const requireCreated = (data) => {
    if (!data || data.id == null) throw new Error('创建响应缺少 ID，请确认创建结果后重试')
    return data
}

const requireSuccess = (data) => {
    if (data !== true) throw new Error('操作未成功，请重试')
    return data
}

// ========== 登录 ==========
export const login = (data) => request.post('/auth/login', data)

// ========== 任务管理 ==========
export const getTaskListByList = (listId) =>
    request.get('/task/list', {params: {listId}}).then(requireArray)

export const getTaskListByProject = (projectId) =>
    request.get('/task/project/list', {params: {projectId}}).then(requireArray)

export const getTaskListByAssignee = (userId) =>
    request.get('/task/assignee/list', {params: {userId}}).then(requireArray)

export const createTask = (data) =>
    request.post('/task', data).then(requireCreated)

export const moveTask = (taskId, targetListId, position) =>
    request.put('/task/move', null, {params: {taskId, targetListId, position}}).then(requireSuccess)

export const addTaskAssignee = (taskId, userId) =>
    request.post('/task/assignees/add', null, {params: {taskId, userId}}).then(requireSuccess)

export const removeTaskAssignee = (taskId, userId) =>
    request.post('/task/assignees/remove', null, {params: {taskId, userId}}).then(requireSuccess)

export const completeTask = (taskId) =>
    request.post('/task/complete', null, {params: {taskId}}).then(requireSuccess)

export const reopenTask = (taskId) =>
    request.post('/task/reopen', null, {params: {taskId}}).then(requireSuccess)

// ========== 项目管理 ==========
// ProjectController 从 SSO 会话读取当前用户，不接受调用方指定 userId。
export const getProjectListByUser = () =>
    request.get('/project/user/list').then(requireArray)

export const createProject = (data) =>
    request.post('/project', data).then(requireCreated)

export const archiveProject = (projectId) =>
    request.put('/project/archive', null, {params: {projectId}}).then(requireSuccess)

// 列表隶属看板，不存在按 projectId 查询列表的端点。
export async function getTaskListsByProject(projectId) {
    const boards = requireArray(await request.get('/board/project', {params: {projectId}}))
    const groups = await Promise.all(boards.map(async board => {
        const lists = requireArray(await request.get('/task-list/board', {params: {boardId: board.id}}))
        return lists.filter(list => Number(list.isArchived) !== 1).map(list => ({
            ...list,
            boardId: board.id,
            boardName: board.name,
            projectId,
        }))
    }))
    return groups.flat()
}

// TaskController 无 GET /task/:id 和通用 PUT。通过已存在的列表查询读取真实详情。
// 新链接携带项目/列表上下文；旧的直接链接回退到当前用户的项目逐个查找。
export async function getTaskDetail(taskId, {projectId, listId} = {}) {
    const findTask = tasks => tasks.find(task => String(task.id) === String(taskId))
    let task
    if (projectId) {
        task = findTask(await getTaskListByProject(projectId))
    } else if (listId) {
        task = findTask(await getTaskListByList(listId))
    } else {
        const projects = await getProjectListByUser()
        for (const project of projects) {
            task = findTask(await getTaskListByProject(project.id))
            if (task) break
        }
    }
    if (!task) throw new Error('未找到任务，或当前用户无权查看所属项目')
    return task
}
