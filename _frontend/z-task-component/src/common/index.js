/**
 * z-task 的 `@/common` 桶。
 *
 * 只做转发：请求实例来自 @yuku123/z-frontend-common（createRequest 统一拦截 + Result 解包），
 * 本仓不另造一份 axios。UI 组件走 `@/common/components/ui`。
 */
export {authRequest, createRequest, request, setupInterceptors, unwrapResponse} from '@yuku123/z-frontend-common'
