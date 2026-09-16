import request from '../utils/request'

// ========== 登录 ==========
// Main backend exposes /api/auth/login (see z-ctc LoginController). NOT /api/user/login.
export const login = (data) =>
    request.post('/api/auth/login', data)

// ========== 任务管理 ==========
// Path conventions: backend uses /api/task/list?listId=, /api/task/project/list?projectId=,
// /api/task/assignee/list?userId=  — see TaskController.java
export const getTaskListByList = (listId) =>
    request.get('/api/task/list', {params: {listId}})

export const getTaskListByProject = (projectId) =>
    request.get('/api/task/project/list', {params: {projectId}})

export const getTaskListByAssignee = (userId) =>
    request.get('/api/task/assignee/list', {params: {userId}})

export const createTask = (data) =>
    request.post('/api/task', data)

export const moveTask = (taskId, targetListId, position) =>
    request.put('/api/task/move', null, {params: {taskId, targetListId, position}})

// Backend uses POST /api/task/assignees/add?taskId=&userId= (NOT DELETE)
export const addTaskAssignee = (taskId, userId) =>
    request.post('/api/task/assignees/add', null, {params: {taskId, userId}})

export const removeTaskAssignee = (taskId, userId) =>
    request.post('/api/task/assignees/remove', null, {params: {taskId, userId}})

// Backend uses POST /api/task/complete?taskId= (NOT /api/task/{taskId}/complete)
export const completeTask = (taskId) =>
    request.post('/api/task/complete', null, {params: {taskId}})

export const reopenTask = (taskId) =>
    request.post('/api/task/reopen', null, {params: {taskId}})

// ========== 项目管理 ==========
// Backend exposes GET /api/project/user/list?userId= (see ProjectController.java)
export const getProjectListByUser = (userId) =>
    request.get('/api/project/user/list', {params: {userId}})

export const createProject = (data) =>
    request.post('/api/project', data)

export const archiveProject = (projectId) =>
    request.put(`/api/project/${projectId}/archive`)
