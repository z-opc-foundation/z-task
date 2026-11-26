/**
 * 待办详情里的**跨域能力**客户端（5 类）。
 *
 * 2026-11-02 随待办前端搬迁，从 z-team 的三处迁入并合并：
 *   `services/api/notes.ts`（个人笔记） + `services/api/personal.ts`（个人 Agent）
 *   + `services/api/schedule.ts`（员工搜索）+ `services/api.ts`（群聊场景 / 图片上传）
 *
 * <h3>为什么这些能力不在 z-task</h3>
 * 待办的**数据归属**在 z-task，但这 5 类能力的归属方**一直是 z-team**：
 * <ul>
 *   <li><b>个人笔记</b>（{@code /api/personal-note/**}）—— 笔记树 / 详情 / 收藏 / 分享</li>
 *   <li><b>个人 Agent</b>（{@code /api/personal-agents}）—— 派发目标列表</li>
 *   <li><b>员工搜索</b>（{@code /api/personal-agents/{id}/schedules/staff-search}）—— 指派候选</li>
 *   <li><b>群聊场景</b>（{@code /api/scenario-instances}）—— 事项关联的群聊项目</li>
 *   <li><b>图片上传</b>（{@code /api/common/upload-image}）—— 编辑器插图</li>
 * </ul>
 * z-task 后端**没有**这些 endpoint ⇒ 前端只能打 z-team。
 *
 * <h3>基址</h3>
 * 与待办读写**同一条基址**（默认 {@code /z-team/api}，见 {@code services/core.js}）：
 * 前端只面对一个 origin，不需要两套地址。
 *
 * <h3>字段风格</h3>
 * z-team 后端 Jackson 是全局 SNAKE_CASE ⇒ 响应字段是 {@code user_id} 之类。
 * 这里统一用 {@code unwrapCamel} 转成 camelCase；
 * 但**手写 Map 的字段不受命名策略影响**（Map 的键就是字面量），
 * 那几处（员工搜索）必须显式对齐 —— 见 {@link searchScheduleStaff}。
 */

import {apiFetch, apiBase, fetchInit, unwrapCamel, unwrapResult} from '../core'
import {toId} from '../../utils/id'

/* ────────────────────────────────────────────
 * 个人笔记
 * ──────────────────────────────────────────── */

/**
 * @typedef {Object} NoteNode
 * @property {string} id 雪花 ID，出网为字符串，禁止 Number()（会按 float64 抹掉末位）
 * @property {string} parentId
 * @property {"folder"|"note"|"owner"} type
 * @property {string} title
 * @property {number} sortOrder
 * @property {string} [updateTime]
 * @property {string} [extraInfo]
 * @property {string} [userId]
 * @property {string} [ownerName]
 * @property {string} [refId] 收藏 refer 虚拟节点指向的原始笔记 id
 * @property {NoteNode[]} children
 */

/**
 * @typedef {Object} FavoriteNote
 * @property {string} refId
 * @property {string} title
 * @property {string} [userId]
 * @property {string} [ownerName]
 * @property {string} [updateTime]
 */

/**
 * @typedef {Object} NoteDetail
 * @property {string} id
 * @property {string} parentId
 * @property {"folder"|"note"} type
 * @property {string} title
 * @property {string|null} content
 * @property {string} [bindKey]
 * @property {string} [extraInfo]
 * @property {string} [createTime]
 * @property {string} [updateTime]
 * @property {boolean} [canEdit] 当前用户是否可编辑（收藏的他人私有笔记为 false）
 */

/** 获取个人笔记文件树。allUsers 仅运营工作台管理员全员视图使用。 */
export async function fetchNoteTree(token = '', allUsers = false) {
    const params = new URLSearchParams()
    if (token) params.set('token', token)
    if (allUsers) params.set('allUsers', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/tree${query}`, fetchInit)
    return unwrapCamel(res, '获取笔记文件树失败')
}

/** 新建文件夹/文档 */
export async function createNote(body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    return unwrapResult(res, '新建笔记失败')
}

/** 获取单个笔记内容 */
export async function fetchNote(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}${query}`, fetchInit)
    return unwrapCamel(res, '获取笔记内容失败')
}

/** 更新笔记标题与内容 */
export async function updateNote(id, body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}${query}`, {
        ...fetchInit,
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    return unwrapResult(res, '保存笔记失败')
}

/** 重命名节点 */
export async function renameNote(id, title, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}/rename${query}`, {
        ...fetchInit,
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title}),
    })
    return unwrapResult(res, '重命名失败')
}

/** 移动节点 */
export async function moveNote(id, body, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}/move${query}`, {
        ...fetchInit,
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    return unwrapResult(res, '移动节点失败')
}

/** 删除节点（文件夹级联删子） */
export async function deleteNote(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}${query}`, {
        ...fetchInit,
        method: 'DELETE',
    })
    return unwrapResult(res, '删除笔记失败')
}

/** 按绑定 key 查找或创建笔记（场景化笔记，如群聊复盘） */
export async function fetchOrCreateBoundNote(bindKey, defaultTitle, extraInfo, token = '') {
    const params = new URLSearchParams()
    params.set('bindKey', bindKey)
    params.set('defaultTitle', defaultTitle)
    params.set('extraInfo', extraInfo)
    if (token) params.set('token', token)
    const res = await apiFetch(`${apiBase()}/personal-note/bound?${params.toString()}`, fetchInit)
    return unwrapCamel(res, '获取绑定笔记失败')
}

/** 生成分享令牌（返回 shareToken） */
export async function shareNote(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}/share${query}`, {
        ...fetchInit,
        method: 'POST',
    })
    return unwrapResult(res, '生成分享链接失败')
}

/** 通过分享令牌免登查看笔记 */
export async function fetchSharedNote(shareToken) {
    const res = await apiFetch(
        `${apiBase()}/personal-note/shared?shareToken=${encodeURIComponent(shareToken)}`,
        fetchInit
    )
    return unwrapCamel(res, '获取分享笔记失败')
}

/** 当前用户收藏的笔记列表（refer 虚拟节点数据） */
export async function fetchFavorites(token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/favorites${query}`, fetchInit)
    return unwrapCamel(res, '获取收藏列表失败')
}

/** 收藏笔记到个人面板 */
export async function favoriteNote(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}/favorite${query}`, {
        ...fetchInit,
        method: 'POST',
    })
    return unwrapResult(res, '收藏笔记失败')
}

/** 取消收藏 */
export async function unfavoriteNote(id, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-note/${id}/favorite${query}`, {
        ...fetchInit,
        method: 'DELETE',
    })
    return unwrapResult(res, '取消收藏失败')
}

/* ────────────────────────────────────────────
 * 个人 Agent（派发目标）
 * ──────────────────────────────────────────── */

/**
 * @typedef {Object} PersonalAgentData
 * @property {number|string} id
 * @property {string} userId
 * @property {number|null} agenthubAgentId
 * @property {string} agentCode
 * @property {string} displayName
 * @property {string|null} avatar
 * @property {number} [shared]
 * @property {boolean} [isLocal]
 * @property {string} [localAgentId]
 * @property {string} [localAgentType]
 * @property {string} [createTime]
 * @property {string} [updateTime]
 */

/**
 * 后端个人 Agent 行 → 前端 {@link PersonalAgentData}。
 *
 * ⚠ **迁移时必须保住这一层归一化**（2026-11-02 实测踩坑）：
 * 后端可能吐 `display_name` / `agent_code` / `agent_hub_agent_id`（snake）
 * 或 `displayName` / `agentCode`（camel），组件一律按 camel 读。
 * 少这一层 ⇒ 下拉框 label 全是空串 / `Agent #undefined`。
 *
 * ⚠ `agentHubAgentId` 是 19 位雪花 ⇒ 只能用 toId（字符串），禁止 Number()。
 */
function normalizePersonalAgent(raw) {
    const r = raw ?? {}
    const str = (...keys) => {
        for (const k of keys) {
            const v = r[k]
            if (v != null && v !== '') return String(v)
        }
        return ''
    }
    const pickId = (...keys) => {
        for (const k of keys) {
            if (r[k] != null) return toId(r[k])
        }
        return null
    }
    return {
        id: r.id,
        userId: str('user_id', 'userId'),
        agentHubAgentId: pickId('agent_hub_agent_id', 'agenthub_agent_id', 'agentHubAgentId', 'agenthubAgentId'),
        agentCode: str('agent_code', 'agentCode'),
        displayName: str('display_name', 'displayName'),
        avatar: r.avatar == null ? null : String(r.avatar),
        shared: r.shared == null ? undefined : Number(r.shared),
        isLocal: r.isLocal,
        localAgentId: r.localAgentId,
        localAgentType: r.localAgentType,
        createTime: r.create_time == null ? r.createTime : String(r.create_time),
        updateTime: r.update_time == null ? r.updateTime : String(r.update_time),
    }
}

/**
 * 列出当前用户的个人 Agent。
 *
 * ⚠ `Array.isArray` 兜底不可省：
 * 上游若因路由缺失返回**非 JSON 的 200**（如被 SPA 兜底成 index.html），
 * `unwrapResult` 会抛错；但若上游给了 `{items: ...}` 之类的包装，
 * 直接 `.map` 会让整个待办详情抽屉崩掉（React 抛错 → 整页 ErrorBoundary）。
 */
export async function fetchPersonalAgents(token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await apiFetch(`${apiBase()}/personal-agents${query}`, fetchInit)
    const list = await unwrapResult(res, '获取个人 Agent 列表失败')
    const arr = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []
    return arr.map(normalizePersonalAgent)
}

/* ────────────────────────────────────────────
 * 员工搜索（指派候选）
 * ──────────────────────────────────────────── */

/**
 * @typedef {Object} StaffSearchResult
 * @property {string} userId
 * @property {string} name
 * @property {string} accountNo
 * @property {string} jobNumber
 * @property {string} flowerName 花名
 */

/**
 * 员工目录搜索。
 *
 * ⚠ 后端返的是**手写 Map**（`TeamStaffAdapter` 构造）：
 *   `{id, name, jobNumber, accountNo, telephone, extend:{...flowerName}}`
 * 而前端类型要的是 `{userId, name, accountNo, jobNumber, flowerName}` ——
 *   后端**没有 userId**（是 id），**flowerName 藏在 extend 里**。
 * ⇒ 这里显式对齐，别指望命名策略（Map 的键不受 SNAKE_CASE 影响）。
 *
 * @param {number|string} agentId 个人 Agent id（只做路径占位，前端传 0 表示「不限定 Agent」）
 */
export async function searchScheduleStaff(agentId, keyword = '', token = '') {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (token) params.set('token', token)
    const res = await apiFetch(
        `${apiBase()}/personal-agents/${agentId}/schedules/staff-search?${params.toString()}`,
        fetchInit
    )
    const raw = await unwrapResult(res, '搜索员工失败')
    return (raw ?? []).map((s) => {
        const extend = (s?.extend ?? {})
        return {
            userId: String(s?.userId ?? s?.id ?? ''),
            name: String(s?.name ?? ''),
            accountNo: String(s?.accountNo ?? ''),
            jobNumber: String(s?.jobNumber ?? ''),
            flowerName: String(extend?.flowerName ?? ''),
        }
    })
}

/* ────────────────────────────────────────────
 * 群聊场景（事项关联的群聊项目）
 * ──────────────────────────────────────────── */

/** 群聊场景实例列表 */
export async function fetchScenarioInstances(token = '', createTimeStart) {
    const params = new URLSearchParams()
    if (token) params.set('token', token)
    if (createTimeStart) params.set('create_time_start', createTimeStart)
    const query = params.toString()
    const res = await apiFetch(
        `${apiBase()}/scenario-instances/${query ? `?${query}` : ''}`,
        fetchInit
    )
    return unwrapResult(res, '获取项目列表失败')
}

/**
 * 创建群聊场景实例（事项「关联群聊项目」）。
 *
 * ⚠ 默认跳过初始化问询，用户可自行 @主控 —— 与 z-team 原实现一致。
 */
export async function createScenarioInstance(payload, token = '') {
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    const body = {
        ...payload,
        extend_params: {...payload.extend_params, skip_init_task: 'true'},
    }
    const res = await apiFetch(`${apiBase()}/scenario-instances/${query}`, {
        ...fetchInit,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    return unwrapResult(res, '创建项目失败')
}

/* ────────────────────────────────────────────
 * 图片上传（编辑器插图）
 * ──────────────────────────────────────────── */

/**
 * 上传图片，返回可访问地址。
 *
 * ⚠ 不要改回 AgentHub-AI 的 `/kapi/agenthub-ai/common/uploadImage`：
 *   2026-10-21 实测生产 opc.zopc.top 上该前缀**没有路由**，POST 直接 405。
 *   `/z-team/api/common/*` 在主壳 nginx 与边缘均已放行。
 */
export async function uploadChatImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiFetch(`${apiBase()}/common/upload-image`, {
        method: 'POST',
        body: formData,
    })
    const data = await unwrapResult(res, '上传图片失败')
    const url = typeof data?.url === 'string' ? data.url : ''
    if (!url) {
        const msg = '上传图片失败：响应缺少图片地址'
        throw {_apiUserError: true, userMessage: msg, message: msg}
    }
    return url
}

/** 批量上传聊天图片 */
export async function uploadChatImages(files) {
    return Promise.all(files.map((file) => uploadChatImage(file)))
}
