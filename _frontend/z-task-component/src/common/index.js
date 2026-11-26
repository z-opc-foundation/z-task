/**
 * z-task 的 `@/common` 桶。
 *
 * 只做转发：请求实例来自 @yuku123/z-frontend-common（createRequest 统一拦截 + Result 解包），
 * 本仓不另造一份 axios。UI 组件走 `@yuku123/z-frontend-common/ui`（共享基座，唯一真源；
 * 本仓原先自拷贝的 `common/components/ui/` 已于本轮删除，见 §11 单一真源收口）。
 */
export {authRequest, createRequest, request, setupInterceptors, unwrapResponse} from '@yuku123/z-frontend-common'
