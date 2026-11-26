/**
 * 待办（todo）API 客户端。
 *
 * 2026-11-02 随待办前端搬迁，从 z-team 的 `workspace/services/api/todo.ts` 迁入（去 TS 标注）。
 *
 * <h3>与源文件的差异</h3>
 * | 维度 | z-team 原件 | 本文件 |
 * |---|---|---|
 * | REST 前缀 | `/z-team/api`（编译期常量） | `${apiBase()}`（运行时可配，默认 `/z-team/api`） |
 * | 派发路径 | `/todo/items/{id}/dispatch` | 同（**未变**） |
 * | 取消派发 | `/todo/items/{id}/undispatch` | 同（**未变**） |
 * | 字段风格 | 前端 camelize | 同（camelize 幂等，两种上游都兼容） |
 *
 * <h3>为什么基址指向 z-team 而不是直连 z-task</h3>
 * 待办的**数据归属**在 z-task，但 z-team 侧保留了一层 Facade
 * （`z-team-web/.../personal/TodoController.java`），它把请求转发到 z-task，
 * 同时**保留 z-team 独有的「派发编排」**（要开个人 Agent 会话）。
 * ⇒ 前端统一打 z-team 的 `/z-team/api/todo/**`，读写与派发**一条基址**，
 * 不用在两套地址之间切换。z-task 与 z-team 之间用 HTTP 桥接
 * （跨仓 + 跨 JVM 版本线：z-task 已迁 SB3/Java17，z-team 仍是 SB2/Java8，
 * 共享 jar 不可行）。
 *
 * <h3>⚠ 顶层事项的 parentId 必须是空串（不是 "0"）</h3>
 * 后端用 `parent_id = 0`（或 null）表示「无父节点」，而消费端一律用
 * `!i.parentId` 判顶层。归一化成字符串 "0" 之后，"0" 是 **truthy**
 * ⇒ 所有顶层事项都被当成子事项过滤掉 ⇒ **待办列表永远是空的**。
 * 这个 bug 极难定位：侧栏项目上的事项**计数是对的**（走的是后端统计），
 * 只有列表渲染是空的，看起来像「没有数据」而不是「口径错」。
 */

import {apiFetch, apiBase, fetchInit, unwrapCamel, unwrapResult} from '../core'
import {toId} from '../../utils/id'

/* ────────────────────────────────────────────
 * 类型定义（TS → JS 后以 JSDoc 保留语义）
 * ──────────────────────────────────────────── */

/**
 * @typedef {Object} TodoMember
 * @property {string} userId
 * @property {string} userName
 */

/**
 * @typedef {Object} TodoProject
 * @property {string} id
 * @property {string} userId
 * @property {string} title
 * @property {string|null} [icon]
 * @property {string|null} [description]
 * @property {"private"|"shared"} visibility
 * @property {number} sortOrder
 * @property {string|null} [extraInfo] 项目空间扩展信息 JSON 字符串（看板列配置等）
 * @property {string|null} [createByName]
 */

/**
 * @typedef {Object} TodoProjectSummary
 * @property {number} openCount
 * @property {TodoMember[]} memberDetails
 */

/**
 * @typedef {Object} TodoProjectBundle
 * @property {TodoProjectSummary[]} owned
 * @property {TodoProjectSummary[]} joined
 */

/**
 * @typedef {Object} TodoLink
 * @property {"note"|"project"|"url"} type
 * @property {number|string} [id] note/project 关联 id；url 类型为空
 * @property {string} title
 * @property {string} [url] url 类型链接地址
 */

/**
 * @typedef {Object} TodoAssignee
 * @property {string} userId
 * @property {string} name
 */

/**
 * @typedef {Object} TodoStatusColumn
 * @property {string} status
 * @property {string} label
 */

/* ────────────────────────────────────────────
 * 看板列
 * ──────────────────────────────────────────── */

/** 默认看板列（项目未配置时使用；与历史固定列一致） */
export const DEFAULT_STATUS_COLUMNS = [
    {status: 'TODO', label: '待办'},
    {status: 'DOING', label: '进行中'},
    {status: 'DONE', label: '已完成'},
]

/** 解析项目扩展信息中的看板列配置；无配置/坏数据返回默认列 */
export function parseStatusColumns(extraInfo) {
    if (!extraInfo || !String(extraInfo).trim()) return [...DEFAULT_STATUS_COLUMNS]
    try {
        const obj = JSON.parse(extraInfo)
        const raw = Array.isArray(obj && obj.statusColumns) ? obj.statusColumns : null
        if (!raw) return [...DEFAULT_STATUS_COLUMNS]
        const cols = raw
            .map((c) => {
                const o = c ?? {}
                const status = String(o.status ?? '').trim().toUpperCase()
                const label = String(o.label ?? '').trim()
                return status && label ? {status, label} : null
            })
            .filter((c) => c != null)
        return cols.length > 0 ? cols : [...DEFAULT_STATUS_COLUMNS]
    } catch {
        return [...DEFAULT_STATUS_COLUMNS]
    }
}

/* ────────────────────────────────────────────
 * 归一化
 * ──────────────────────────────────────────── */

/**
 * 后端 `parent_id` 是否表示「无父节点（顶层事项）」。
 *
 * 后端有三种写法都表示顶层：null、0、""。全部收敛成「顶层」，
 * 让归一化后的 parentId 为**空串**（falsy），与消费端 `!i.parentId` 的判法对齐。
 */
function isRootTodoParentId(v) {
    if (v === null || v === undefined) return true
    const s = String(v).trim()
    return s === '' || s === '0'
}

/** 后端实体（tags/links 为 JSON 字符串）→ 视图对象 */
function normalizeTodoItem(raw) {
    const r = raw ?? {}

    const parseTags = (v) => {
        if (typeof v !== 'string' || !v.trim()) return []
        try {
            const arr = JSON.parse(v)
            return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
        } catch {
            return []
        }
    }

    const parseLinks = (v) => {
        if (typeof v !== 'string' || !v.trim()) return []
        try {
            const arr = JSON.parse(v)
            return Array.isArray(arr)
                ? arr.filter((x) => !!x && typeof x === 'object' && typeof x.type === 'string')
                : []
        } catch {
            return []
        }
    }

    /** 指派人 ids：优先 assigneeUserIds（数组或 JSON 字符串），退化到单值 assigneeUserId */
    const parseAssigneeIds = () => {
        const src = r.assigneeUserIds
        let arr = null
        if (Array.isArray(src)) {
            arr = src
        } else if (typeof src === 'string' && src.trim()) {
            try {
                const parsed = JSON.parse(src)
                arr = Array.isArray(parsed) ? parsed : null
            } catch {
                arr = src.split(',')
            }
        }
        if (arr) {
            const ids = arr.map((x) => String(x ?? '').trim()).filter(Boolean)
            if (ids.length > 0) return Array.from(new Set(ids))
        }
        const single = r.assigneeUserId == null ? '' : String(r.assigneeUserId)
        return single.trim() ? [single.trim()] : []
    }

    /** 指派人含姓名：后端未返回 assignees 时按 ids 兜底（name 暂用 userId） */
    const parseAssignees = (ids) => {
        const src = r.assignees
        const list = Array.isArray(src)
            ? src
                .map((x) => {
                    const o = x ?? {}
                    const userId = String(o.userId ?? '').trim()
                    return userId ? {userId, name: String(o.name ?? '').trim() || userId} : null
                })
                .filter((x) => x != null)
            : []
        if (list.length > 0) return list
        return ids.map((userId) => ({userId, name: userId}))
    }

    const assigneeUserIds = parseAssigneeIds()
    return {
        id: toId(r.id),
        projectId: r.projectId == null ? null : toId(r.projectId),
        userId: String(r.userId ?? ''),
        title: String(r.title ?? ''),
        detail: r.detail == null ? null : String(r.detail),
        status: r.status ?? 'TODO',
        priority: r.priority ?? 'MEDIUM',
        dueDate: r.dueDate == null ? null : String(r.dueDate).slice(0, 10),
        assigneeUserId: assigneeUserIds[0] ?? null,
        assigneeUserIds,
        assignees: parseAssignees(assigneeUserIds),
        projectTitle:
            r.projectTitle == null || !String(r.projectTitle).trim()
                ? null
                : String(r.projectTitle),
        tags: parseTags(r.tags),
        links: parseLinks(r.links),
        // ⚠ 顶层必须是空串（falsy），见文件头说明
        parentId: isRootTodoParentId(r.parentId) ? '' : toId(r.parentId),
        sortOrder: r.sortOrder == null ? 0 : Number(r.sortOrder),
        completedAt: r.completedAt == null ? null : String(r.completedAt),
        completedBy: r.completedBy == null ? null : String(r.completedBy),
        createByName: r.createByName == null ? null : String(r.createByName),
        updateTime: r.updateTime == null ? null : String(r.updateTime),
        agentId: r.agentId == null ? null : toId(r.agentId),
        agentSessionId: r.agentSessionId == null ? null : toId(r.agentSessionId),
    }
}

/**
 * 后端项目实体 → 视图对象：与 {@link normalizeTodoItem} 保持同一口径。
 * 项目 id 必须统一转成字符串，否则与事项的 projectId 类型不一致，
 * `===` / `Map.get` 全部失配（表现为项目名回显为裸 id）。
 */
function normalizeTodoProject(raw) {
    const o = raw ?? {}
    return {
        id: toId(o.id),
        userId: String(o.userId ?? ''),
        title: String(o.title ?? ''),
        icon: o.icon == null ? null : String(o.icon),
        description: o.description == null ? null : String(o.description),
        visibility: o.visibility === 'shared' ? 'shared' : 'private',
        sortOrder: o.sortOrder == null ? 0 : Number(o.sortOrder),
        extraInfo: o.extraInfo == null ? null : String(o.extraInfo),
        createByName: o.createByName == null ? null : String(o.createByName),
    }
}

/** 项目汇总（含未完成计数与成员明细） */
function normalizeTodoProjectSummary(raw) {
    const o = raw ?? {}
    const members = Array.isArray(o.memberDetails) ? o.memberDetails : []
    return {
        ...normalizeTodoProject(o),
        openCount: o.openCount == null ? 0 : Number(o.openCount),
        memberDetails: members
            .map((m) => {
                const mo = m ?? {}
                const userId = String(mo.userId ?? '').trim()
                return userId
                    ? {userId, userName: String(mo.userName ?? '').trim() || userId}
                    : null
            })
            .filter((m) => m != null),
    }
}

function normalizeDispatchResult(raw) {
    const o = raw ?? {}
    return {
        todoId: toId(o.todoId),
        sessionId: o.sessionId == null ? null : toId(o.sessionId),
        agentId: o.agentId == null ? null : toId(o.agentId),
        projectSpaceId: o.projectSpaceId == null ? 0 : toId(o.projectSpaceId),
        projectSpaceTitle: String(o.projectSpaceTitle ?? ''),
        status: String(o.status ?? ''),
        kickoff: String(o.kickoff ?? ''),
        spaceEntries: Array.isArray(o.spaceEntries)
            ? o.spaceEntries.map((e) => ({
                path: String(e.path ?? ''),
                name: String(e.name ?? ''),
                dir: Boolean(e.dir),
                size: e.size == null ? 0 : Number(e.size),
            }))
            : [],
    }
}

/* ────────────────────────────────────────────
 * 项目
 * ──────────────────────────────────────────── */

/** 项目列表（我拥有的 + 我加入的） */
export async function fetchTodoProjects(token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/projects${query}`, fetchInit)
    const raw = await unwrapCamel(res, '获取待办项目失败')
    return {
        owned: (raw?.owned ?? []).map(normalizeTodoProjectSummary),
        joined: (raw?.joined ?? []).map(normalizeTodoProjectSummary),
    }
}

/** 新建项目 */
export async function createTodoProject(body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/projects${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    const raw = await unwrapCamel(res, '新建项目失败')
    return normalizeTodoProject(raw)
}

/** 更新项目（仅 owner） */
export async function updateTodoProject(id, body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/projects/${id}${query}`, {
        ...fetchInit,
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    const raw = await unwrapCamel(res, '更新项目失败')
    return normalizeTodoProject(raw)
}

/** 删除项目（事项级联删除） */
export async function deleteTodoProject(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/projects/${id}${query}`, {
        ...fetchInit,
        method: 'DELETE',
    })
    return unwrapResult(res, '删除项目失败')
}

/** 添加项目成员（自动转 shared） */
export async function addTodoProjectMember(id, body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/projects/${id}/members${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    const raw = await unwrapCamel(res, '添加成员失败')
    return normalizeTodoProject(raw)
}

/** 移除项目成员 */
export async function removeTodoProjectMember(id, userId, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(
        `${apiBase()}/todo/projects/${id}/members/${encodeURIComponent(userId)}${query}`,
        {...fetchInit, method: 'DELETE'}
    )
    const raw = await unwrapCamel(res, '移除成员失败')
    return normalizeTodoProject(raw)
}

/* ────────────────────────────────────────────
 * 事项
 * ──────────────────────────────────────────── */

/** 事项视图查询（返回视图对象，tags/links 已解析） */
export async function fetchTodoItems(query = {}, token = '') {
    const params = new URLSearchParams()
    if (token) params.set('token', token)
    if (query.view) params.set('view', query.view)
    if (query.projectId != null) params.set('projectId', String(query.projectId))
    if (query.status) params.set('status', query.status)
    if (query.keyword) params.set('keyword', query.keyword)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items${qs}`, fetchInit)
    const raw = await unwrapCamel(res, '获取事项失败')
    return (raw ?? []).map(normalizeTodoItem)
}

/** 新建事项（projectId 为空 = 收集箱） */
export async function createTodoItem(body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    const raw = await unwrapCamel(res, '新建事项失败')
    return normalizeTodoItem(raw)
}

/** 更新事项 */
export async function updateTodoItem(id, body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}${query}`, {
        ...fetchInit,
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    const raw = await unwrapCamel(res, '更新事项失败')
    return normalizeTodoItem(raw)
}

/** 完成事项（可带完成备注） */
export async function completeTodoItem(id, result = '', token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}/complete${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({result}),
    })
    const raw = await unwrapCamel(res, '完成事项失败')
    return normalizeTodoItem(raw)
}

/** 重开事项 */
export async function reopenTodoItem(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}/reopen${query}`, {
        ...fetchInit,
        method: 'POST',
    })
    const raw = await unwrapCamel(res, '重开事项失败')
    return normalizeTodoItem(raw)
}

/** 调整排序（可同时换项目） */
export async function reorderTodoItem(id, body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}/reorder${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    const raw = await unwrapCamel(res, '调整排序失败')
    return normalizeTodoItem(raw)
}

/** 批量调整事项排序/移动（拖拽落地；projectId=0 移入收集箱） */
export async function reorderTodoItemsBatch(updates, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/reorder-batch${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({updates}),
    })
    return unwrapResult(res, '调整排序失败')
}

/** 批量调整项目排序（侧栏拖拽，仅 owner） */
export async function reorderTodoProjectsBatch(updates, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/projects/reorder-batch${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({updates}),
    })
    return unwrapResult(res, '调整项目排序失败')
}

/** 删除事项 */
export async function deleteTodoItem(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}${query}`, {
        ...fetchInit,
        method: 'DELETE',
    })
    return unwrapResult(res, '删除事项失败')
}

/* ────────────────────────────────────────────
 * 待办 → Agent 派发（一条待办 = 一个 Agent 会话）
 * ──────────────────────────────────────────── */

/**
 * 把一条待办交给 Agent（幂等：已派发则复用旧会话）。
 *
 * <p>收集箱待办没有项目空间，后端会明确拒绝 —— 前端应先引导用户归入项目。
 *
 * ⚠ **端点是 `dispatch`（不是 `dispatch-agent`）**：
 * 走的是 z-team 的 Facade（`z-team-web/.../personal/TodoController.java`），
 * 它把派发**编排**留在 z-team —— 要开个人 Agent 会话，这是 z-team 独有能力。
 * z-task 直连时的端点叫 `dispatch-agent`，它只回写 agentId/agentSessionId 绑定、
 * 不真正执行派发 ⇒ 直连会得到「派发成功但没有会话」。
 */
export async function dispatchTodoToAgent(id, agentId, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}/dispatch${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({agentId}),
    })
    const raw = await unwrapCamel(res, '派发给 Agent 失败')
    return normalizeDispatchResult(raw)
}

/** 取消派发（只解绑，不删会话 —— 会话里的执行记录可能还有价值） */
export async function undispatchTodoItem(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/todo/items/${id}/undispatch${query}`, {
        ...fetchInit,
        method: 'POST',
    })
    const raw = await unwrapCamel(res, '取消派发失败')
    return normalizeTodoItem(raw)
}

/** 项目空间目录树（项目 = 服务器上一个文件夹） */
export async function fetchTodoSpaceTree(projectId, token = '', depth = 3) {
    const params = new URLSearchParams()
    if (token) params.set('token', token)
    params.set('depth', String(depth))
    const res = await apiFetch(
        `${apiBase()}/todo/projects/${projectId}/space/tree?${params.toString()}`,
        fetchInit
    )
    const raw = await unwrapCamel(res, '获取项目空间失败')
    return (raw?.entries ?? []).map((e) => ({
        path: String(e.path ?? ''),
        name: String(e.name ?? ''),
        dir: Boolean(e.dir),
        size: e.size == null ? 0 : Number(e.size),
    }))
}
