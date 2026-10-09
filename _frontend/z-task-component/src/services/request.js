/**
 * z-task 请求实例
 *
 * 从 @yuku123/z-frontend-common 工厂创建，baseURL 指向 /api。
 * 追加 X-User-Id 请求头（部分后端接口如 ProjectController.create 需要）。
 * token 注入 + 401 处理逻辑统一走共享拦截器。
 */
import {createRequest} from '@yuku123/z-frontend-common'

const request = createRequest({baseURL: '/api'})

// z-task 业务特定：注入 X-User-Id 头
request.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId')
    if (userId) {
        config.headers['X-User-Id'] = userId
    }
    return config
})

export default request

// 前缀参数注入（lead 005 section 9.3）：默认 '/api'。
export function configureTask(config) {
    if (config && config.apiBase !== undefined) {
        request.defaults.baseURL = config.apiBase
    }
}
