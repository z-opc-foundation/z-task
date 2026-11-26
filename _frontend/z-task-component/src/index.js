/**
 * Task 组件库 - 导出所有可复用组件
 */
export {default as TaskCard} from './components/TaskCard'
export {default as TaskTable} from './components/TaskTable'
export {default as ProjectSelect} from './components/ProjectSelect'

// 业务页面 (FEATURE015+ 后从 z-opc-main-starter-frontend 迁入)
export {default as ProjectList} from './components/ProjectList'
export {default as TaskList} from './components/TaskList'
export {default as TaskDashboard} from './components/TaskDashboard'
export {default as TaskApp} from './components/TaskApp'

// 待办（todo）—— 2026-11-02 从 z-team 迁入
// 单一真源：z-team 改为从这里引入（`@yuku123/z-task-component`），
// 不再保留自己的 TodoTab 副本 ⇒ 两份实现不会漂移。
export {default as TodoTab} from './components/TodoTab/index'
export {DRAG_ITEM_MIME, DRAG_COLUMN_MIME} from './components/TodoTab/index'

// 待办与笔记/群聊的「关联」纯函数工具。
// z-team 的 PersonalNoteTab 要用（笔记详情里回显「关联的待办」），
// 而这些函数读的是待办的 TodoItemView 结构 ⇒ 归属待办域，跟着一起搬。
// ⚠ 必须从这里导出、不能各仓各留一份：一旦链接语义变了（如新增 link.type），
//   两份实现会静默分叉 —— 一边能显示、另一边看不见。
export {
    buildTodoProjectContext,
    todoProjectLabel,
    flattenTodoOptions,
    findTodosLinkedToNote,
    todoHasNoteLink,
    addNoteLink,
    removeNoteLink,
    removeProjectLink,
    linkedTodoChipLabel,
} from './components/TodoTab/todoLinkUtils'

// API 客户端
export {taskApi} from './api'
export {default as api} from './api'

// 待办 API 基址配置（宿主按环境注入：本地 /z-team/api，生产 /kapi/z-team/api）
export {configureApiBase, apiBase} from './services/core'
export {configureTask} from './services/request'

// 待办的状态桥接（token / currentUser）。
// ⚠ z-team 宿主**必须**注入自己的 zustand Hook —— 它的 currentUser 不落 localStorage，
//   只读 localStorage 会拿到 null，导致「指派给我的」与 owner 判定退化。
export {configureTodoStore, resetTodoStore, readToken, readCurrentUser} from './store/useAppStore'

// 组件文档页（lead 008 §7）：主壳按统一名字取，各仓一致
export {default as ComponentDocPage} from './pages/ComponentDoc.jsx'
