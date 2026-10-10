/**
 * z-task 任务 / 项目 API (从 z-opc-main-starter-frontend/src/services/api.ts 迁入).
 *
 * 后端端点 (z-task):
 *   - GET    /api/project/user/list     — 我的项目列表
 *   - POST   /api/project              — 创建项目
 *   - PUT    /api/project/{id}         — 更新项目
 *   - PUT    /api/project/{id}/archive — 归档
 *   - GET    /api/task/project/list?projectId=  — 项目下任务
 *   - POST   /api/task                 — 创建任务
 *   - PUT    /api/task/move            — 移动任务
 *   - POST   /api/task/complete?taskId= — 完成任务
 *
 * 注意: 走 z-frontend-common 的 createRequest (统一拦截 + Result 解包),
 *      而不是裸 axios. 这样后端 Result 包装 {code, data, message} 会被自动解包,
 *      业务层拿到的 r 已经是内层数据, 不需要再 .then(r => r.data).
 */

import {authRequest, createRequest} from '@/common'

const request = createRequest('task')

export const taskApi = {
    // === 项目 ===
    listMyProjects: () => authRequest.get('/project/user/list'),
    createProject: (data) => request.post('/project', data),
    updateProject: (id, data) => request.put(`/project/${id}`, data),
    archiveProject: (id) => request.put(`/project/${id}/archive`),

    // === 任务 ===
    listTasksByProject: (projectId) => request.get('/task/project/list', {params: {projectId}}),
    listTasksByList: (listId) => request.get('/task/list', {params: {listId}}),
    createTask: (data) => request.post('/task', data),
    completeTask: (id) => request.post('/task/complete', null, {params: {taskId: id}}),
    moveTask: (taskId, targetListId, position) =>
        request.put('/task/move', null, {params: {taskId, targetListId, position}}),

    // === 任务详情 ===
    getTaskDetail: (id) => request.get(`/task/${id}`),
    updateTask: (id, data) => request.put(`/task/${id}`, data),
    deleteTask: (id) => request.delete(`/task/${id}`),
}

export default taskApi
