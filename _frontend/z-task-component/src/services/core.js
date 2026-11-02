/**
 * z-task 前端 HTTP 基础层。
 *
 * 2026-11-02 随待办前端搬迁从 z-team 的 `services/api/core.ts` 迁入并改写：
 *
 * | 维度 | z-team 原件 | 本文件 |
 * |---|---|---|
 * | REST 前缀 | `/z-team/api`（本地）/ `/kapi/z-team/api`（生产） | 见下方 {@link BASE} |
 * | SSO 失效处理 | `redirectToApexLogin()` + 清 `ft_token`/`USER_INFO` | 跳 z-task 自己的登录页 |
 * | 响应信封 | z-util `Result`（`code/msg/data/success`） | z-util `Result`（`code/message/data/success`） |
 * | 字段风格 | 全局 SNAKE_CASE ⇒ 前端要 camelize | **已是 camelCase**（Jackson 默认） |
 *
 * ⚠ **成功码是 200，不是 0**（实测 `BaseStatusCode.OK.getCode() == 200`）。
 * z-team 侧客户端曾误判成 0 ⇒ 上游返回成功却被当失败抛异常。这里按实测口径。
 *
 * ⚠ camelizeKeys **不需要**：z-task 的 Jackson 没有配 SNAKE_CASE，
 * 后端直接吐 camelCase 字段。前端直接读 `extraInfo` / `dueDate` 等。
 *
 * <h3>待办请求为什么打 z-team 而不是直连 z-task</h3>
 * 待办的**数据归属**在 z-task，但 z-team 侧保留了一层 Facade
 * （`z-team-web/.../personal/TodoController.java`），它把请求转发到 z-task，
 * 同时**保留 z-team 独有的「派发编排」**（开个人 Agent 会话）。
 *
 * ⇒ 前端统一打 z-team 的 `/z-team/api/todo/**`，读写与派发**一条基址**，
 * 不用在两套地址之间切换。z-task 与 z-team 之间用 HTTP 桥接（跨仓 + 跨 JVM 版本线，
 * 共享 jar 不可行）。
 */

/** z-util Result 信封。z-task 用 `message`（不是 z-team 的 `msg`）。 */
const Z_RESULT = {success: undefined, data: undefined, message: undefined, code: undefined}

/** Result 信封的成功状态码 —— 实测 200。 */
export const CODE_SUCCESS = 200

/**
 * REST 前缀。
 *
 * ⚠ **待办与跨域能力默认打 z-team 的 Facade**（`/z-team/api`），
 * 不是 z-task 自己的 `/api`。
 *
 * 原因（2026-11-02 实测）：
 * 1. z-team 的 `TodoController`（Facade）把待办读写转发到 z-task，
 *    同时保留「派发编排」（要开个人 Agent 会话）—— 这是 z-team 独有能力。
 * 2. 待办详情里的 5 类跨域能力（个人笔记 / 个人 Agent / 员工搜索 / 群聊场景 / 图片上传）
 *    **归属方一直是 z-team**，z-task 根本没有这些 endpoint。
 * 3. ⇒ 走 z-team 一条基址，读写 + 派发 + 跨域能力全齐；前端零跨域、nginx 零改动。
 *
 * ⚠ 生产环境主壳在 `/kapi` 前缀后面（Kong），此时由宿主通过
 * {@link configureApiBase} 覆盖为 `/kapi/z-team/api`。
 * 本地开发（suit / 主壳 vite dev）用 `/z-team/api`。
 *
 * ⚠ 直连 z-task 的路径（`/api`）仍可用：调用 {@link configureApiBase}('/api') 即可切换。
 * 那条路的代价是「派发」与 5 类跨域能力要另找出口。
 */
export const BASE = '/z-team/api'

/**
 * 覆盖 REST 前缀（运行时由宿主注入）。
 *
 * ⚠ 生产（Kong `/kapi` 前缀）与本地（`/z-team/api`）路径不同，
 * 由宿主在启动时按环境注入，避免把环境判断写进组件包。
 */
let currentBase = BASE

export function configureApiBase(base) {
    if (base && typeof base === 'string') {
        currentBase = base.replace(/\/$/, '')
    }
    return currentBase
}

/** 当前生效的 REST 前缀。 */
export function apiBase() {
    return currentBase
}

export const fetchInit = {credentials: 'include'}

/* ──── 错误类型 ──── */

/** API 层统一错误类型；UI 不自动弹窗，由调用方按需处理。 */
export class ApiUserError extends Error {
    constructor(userMessage) {
        super(userMessage)
        this.name = 'ApiUserError'
        this.userMessage = userMessage
        this._apiUserError = true
    }
}

export function isApiUserError(e) {
    if (e instanceof ApiUserError) return true
    return !!(e && typeof e === 'object' && e._apiUserError)
}

export function getApiUserErrorMessage(e) {
    if (isApiUserError(e)) return e.userMessage || e.message || ''
    return ''
}

/* ──── 401 断路器 ──── */

let isRedirectingToLogin = false

const UNAUTHORIZED_MESSAGE = '登录已失效，请重新登录'

/**
 * 识别「登录失效」响应体。
 *
 * z-task 的 SSO 拦截器在登录态失效时返回 HTTP 401 或 `code=401` 的信封，
 * 两种都要认 —— 只看 status 会漏判并退化成逐请求弹窗。
 */
export function isUnauthorizedPayload(body) {
    if (!body) return false
    if (Number(body.code) === 401) return true
    const msg = typeof body.message === 'string' ? body.message : ''
    return /登录(?:已)?(?:失效|过期)|重新登录|未登录/.test(msg)
}

/**
 * 处理 401：首次触发时清 token 并跳登录页；后续 401 静默抑制。
 */
export function throwUnauthorized() {
    if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        try {
            localStorage.removeItem('token')
        } catch {
            /* 隐私模式下 localStorage 不可用 */
        }
        try {
            window.location.replace('/z-task/login')
        } catch {
            /* 跳转失败不阻塞抛错 */
        }
    }
    throw {
        _apiUserError: true,
        userMessage: UNAUTHORIZED_MESSAGE,
        message: UNAUTHORIZED_MESSAGE,
    }
}

function friendlyHttpMessage(res, fallback) {
    if (res.status === 401) return '登录已失效，请重新登录'
    if (res.status === 403) return '没有权限访问该资源'
    if (res.status === 404) return '接口不存在，请确认后端已启动且路径为 /api'
    if (res.status >= 500) return '服务暂时不可用，请稍后重试'
    if (res.status >= 400) return fallback
    return fallback
}

/* ──── 请求 ──── */

/**
 * 统一 fetch 封装。
 *
 * ⚠ 显式 Accept：后端 SsoInterceptor 只看 Accept / Content-Type 是否含
 * application/json ⇒ 裸 fetch 不带 Accept 会落 302 分支（跳登录页 ⇒
 * 200 + text/html ⇒ res.json() 抛错）。
 */
export async function apiFetch(url, init) {
    const mergedHeaders = {
        Accept: 'application/json',
        ...(init && init.headers ? init.headers : {}),
    }
    const userId = localStorage.getItem('userId')
    if (userId) mergedHeaders['X-User-Id'] = userId

    let res
    try {
        res = await fetch(url, {...fetchInit, ...(init || {}), headers: mergedHeaders})
    } catch (e) {
        const msg = '无法连接服务器，请确认 z-task 后端已启动（如 127.0.0.1:8082）'
        throw {_apiUserError: true, userMessage: msg, message: msg}
    }
    return res
}

/**
 * 解 z-util Result 信封，返回 `data`。
 *
 * ⚠ 成功判据是 `success === true` **或** `code === 200` —— 两边都认，
 * 避免上游只给 code 不给 success 时被误判为失败。
 *
 * ⚠ **HTTP 200 但响应体不是 JSON ⇒ 必须抛错，不能把原文当数据返回**。
 * 这不是洁癖，是 2026-11-02 实测踩到的坑：
 *   后端（或网关）对未匹配的 `/api/**` 会**兜底吐 index.html（状态 200）**，
 *   原实现 `return text` 于是把一整段 HTML 当成"数据"交给了调用方 ——
 *   调用方 `list.map(...)` 立刻抛 `o.map is not a function`，
 *   但错误点离真正的原因（接口 404 / 路径写错）隔了好几层，
 *   排查时只能看到一个莫名其妙的下拉框崩溃。
 * ⇒ 现在统一报「接口返回的不是 JSON」，并把 URL 带上，一眼能看出打错地址。
 *
 * @param {Response} res
 * @param {string} fallbackMsg
 * @param {{allowText?: boolean}} [opts] allowText=true 时保留旧行为（确实要读纯文本的接口）
 */
export async function unwrapResult(res, fallbackMsg, opts) {
    if (res.status === 401) {
        throwUnauthorized()
    }
    const text = await res.text().catch(() => '')
    let body = {}
    if (text) {
        try {
            body = JSON.parse(text)
        } catch {
            if (!res.ok) {
                const errorMsg = friendlyHttpMessage(res, fallbackMsg)
                throw {_apiUserError: true, userMessage: errorMsg, message: errorMsg}
            }
            if (opts && opts.allowText) {
                return text
            }
            const where = res.url ? `（${res.url}）` : ''
            const errorMsg =
                `${fallbackMsg}：接口返回的不是 JSON${where} —— `
                + '通常是该路径不存在、被网关/前端兜底成了 index.html。'
            throw {_apiUserError: true, userMessage: errorMsg, message: errorMsg}
        }
    }
    if (isUnauthorizedPayload(body)) {
        throwUnauthorized()
    }
    const success = body.success === true || Number(body.code) === CODE_SUCCESS
    if (success) {
        return body.data !== undefined ? body.data : true
    }
    if (body.success === false || body.code !== undefined) {
        const errorMsg = body.message || body.msg || body.detail || fallbackMsg
        throw {_apiUserError: true, userMessage: errorMsg, message: errorMsg}
    }
    if (!res.ok) {
        const errorMsg = body.detail || body.message || friendlyHttpMessage(res, fallbackMsg)
        throw {_apiUserError: true, userMessage: errorMsg, message: errorMsg}
    }
    return body
}

/**
 * unwrapResult 的别名（保留 z-team 的调用名，便于逐文件对照搬迁）。
 *
 * ⚠ **必须 camelize**：待办请求现在打 z-team 的 Facade，而 z-team 后端
 * Jackson 是全局 SNAKE_CASE ⇒ 响应字段是 `user_id` / `extra_info`；
 * z-task 直连时才是 camelCase。
 * ⇒ 这一层把两种上游**统一**成 camelCase，前端只认 camelCase 一种。
 *
 * camelize 是**幂等**的：已经是 camelCase 的键（`userId`）不会被二次转换
 * （正则只匹配 `_` 后的字符），所以直连 z-task 时行为不变。
 */
export async function unwrapCamel(res, fallbackMsg) {
    return camelizeKeys(await unwrapResult(res, fallbackMsg))
}

/** snake_case 尾巴：`_x` → `X`（只转第一个字符，保留其余原样）。 */
const SNAKE_TAIL = /_+([a-z0-9])/gi

/**
 * 键名 camelize：只改键名，值一律原样。
 *
 * ⚠ **值原样**很重要：雪花 id 在 wire 上是字符串，转 Number 会超出 2^53 精度
 * （2094497289705062402 → …2400）。
 */
export function camelizeKeys(value) {
    if (Array.isArray(value)) return value.map((v) => camelizeKeys(v))
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        const out = {}
        for (const [k, v] of Object.entries(value)) {
            out[k.replace(SNAKE_TAIL, (_, ch) => ch.toUpperCase())] = camelizeKeys(v)
        }
        return out
    }
    return value
}
