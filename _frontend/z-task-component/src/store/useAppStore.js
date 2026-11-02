/**
 * 待办组件的**应用状态桥接层**（可注入）。
 *
 * 2026-11-02 随待办前端搬迁引入。
 *
 * <h3>为什么不直接用 zustand 的 useAppStore</h3>
 * z-team 的 `useAppStore` 是个 **95KB / 2000+ 行**的巨型 store，管的是整个团队工作台
 * （项目、聊天、Agent、文件、WebSocket…）。待办组件只用到其中**两个字段**：
 * <ul>
 *   <li>{@code token} —— 当前登录令牌</li>
 *   <li>{@code currentUser} —— 当前用户（取 {@code .id} 作为 FT userId）</li>
 * </ul>
 * ⇒ 把那 95KB store 拖进 z-task-component 不划算（还要求 z-task 侧装 zustand）。
 *
 * <h3>默认实现：读 localStorage</h3>
 * 与 z-team 的持久化口径一致：
 * <pre>
 * token:       localStorage.getItem("token") || localStorage.getItem("z_team_token")
 * currentUser: JSON.parse(localStorage.getItem("userInfo"))
 * </pre>
 *
 * <h3>⚠ 宿主应注入（{@link configureTodoStore}）</h3>
 * **z-team 宿主必须注入**。原因：z-team 的 `currentUser` 是登录后由 API 拉取、
 * 存在 zustand 里的，**不落 localStorage**。只读 localStorage 会让 `currentUser`
 * 恒为 null ⇒ 「指派给我的」视图与 owner 判定只能靠数据兜底猜，多项目场景会判错。
 *
 * 注入方式（宿主入口执行一次，**必须早于首次渲染**）：
 * <pre>
 * import {configureTodoStore} from '@yuku123/z-task-component'
 * import {useAppStore as useTeamStore} from './store/useAppStore'
 *
 * configureTodoStore({
 *   useToken: () => useTeamStore((s) => s.token),
 *   useCurrentUser: () => useTeamStore((s) => s.currentUser),
 * })
 * </pre>
 * 传的是**Hook**（不是普通取值函数）⇒ 沿用宿主 store 的订阅语义，
 * 登录态变化后待办组件会自动重渲染。
 *
 * 未注入时退回 localStorage 实现（z-task 独立壳 / 主壳自有登录态的场景）。
 */

/* ──────────── 默认实现：localStorage ──────────── */

/** 读当前 token（与 z-team 的 `useAppStore` 同口径）。 */
export function readToken() {
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem('token') || localStorage.getItem('z_team_token') || ''
}

/**
 * 读当前用户。
 *
 * @returns {object|null} 至少含 `id` / `userId` 的用户对象；没有则 null
 */
export function readCurrentUser() {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem('userInfo')
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return null
        // 补齐 id：有些写入方只写 userId
        if (parsed.id == null && parsed.userId != null) {
            parsed.id = parsed.userId
        }
        return parsed
    } catch {
        return null
    }
}

/**
 * 默认 Hook：直接读 localStorage。
 *
 * ⚠ **不做订阅** —— token / currentUser 在一次会话内基本不变；
 * 真要变（重新登录）时页面会整页刷新，状态自然重取。
 * 需要响应式的宿主按上面的方式注入自己的 Hook。
 */
function useLocalToken() {
    return readToken()
}

function useLocalCurrentUser() {
    return readCurrentUser()
}

/* ──────────── 可注入的桥接 ──────────── */

let accessor = {
    useToken: useLocalToken,
    useCurrentUser: useLocalCurrentUser,
}

/**
 * 注入宿主的状态访问器。
 *
 * ⚠ **必须在首次渲染之前调用**（入口 main.jsx / App 顶层模块）。
 * 渲染中途切换会改变 Hook 调用链，React 会报
 * "React has detected a change in the order of Hooks"。
 *
 * @param {{useToken?: () => string, useCurrentUser?: () => (object|null)}} next
 * @returns 当前生效的访问器（浅拷贝）
 */
export function configureTodoStore(next) {
    if (next && typeof next === 'object') {
        if (typeof next.useToken === 'function') accessor.useToken = next.useToken
        if (typeof next.useCurrentUser === 'function') accessor.useCurrentUser = next.useCurrentUser
    }
    return {...accessor}
}

/** 恢复默认（localStorage）实现，主要供测试使用。 */
export function resetTodoStore() {
    accessor = {useToken: useLocalToken, useCurrentUser: useLocalCurrentUser}
}

/**
 * 订阅当前 token。
 *
 * ⚠ 调用的 Hook 由 {@link configureTodoStore} 决定 —— 所以这里必须
 * **无条件**调用（不能放进 if / 循环），否则违反 Hook 规则。
 *
 * @returns {string} token（无登录态时是空串）
 */
export function useAppToken() {
    return accessor.useToken() || ''
}

/** 订阅当前用户。@returns {object|null} */
export function useAppCurrentUser() {
    return accessor.useCurrentUser() ?? null
}

/**
 * **兼容 z-team `useAppStore` 调用形态**的适配器。
 *
 * 待办组件里原来是 `useAppStore((s) => s.token)` / `useAppStore((s) => s.currentUser)`，
 * 这里保留同样的选择器签名，搬迁时调用点**一行都不用改**。
 *
 * @param {(state: {token: string, currentUser: object|null}) => any} selector
 */
export function useAppStore(selector) {
    const token = useAppToken()
    const currentUser = useAppCurrentUser()
    return selector({token, currentUser})
}

export default useAppStore
