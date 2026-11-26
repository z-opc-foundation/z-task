/**
 * 待办域 API 统一出口。
 *
 * TodoTab 组件只从这里 import（不再分别引 todo / crossdomain 两个文件），
 * 与 z-team 原 `services/api.ts` 的用法习惯对齐 ⇒ 搬迁时 import 路径改动最小。
 *
 * ⚠ 命名冲突提醒：`services/api.js`（任务/项目 API）与本目录 `services/api/`
 *   是**两个不同模块**。本目录优先（`./api` 解析到目录的 index.js），
 *   但 `import api from '../services/api'` 这种**默认导入**会拿到目录的 index.js
 *   —— 任务 API 的默认导出在 `src/api.js`（另一个路径），别混。
 */

export {
    DEFAULT_STATUS_COLUMNS,
    parseStatusColumns,
    fetchTodoProjects,
    createTodoProject,
    updateTodoProject,
    deleteTodoProject,
    addTodoProjectMember,
    removeTodoProjectMember,
    fetchTodoItems,
    createTodoItem,
    updateTodoItem,
    completeTodoItem,
    reopenTodoItem,
    reorderTodoItem,
    reorderTodoItemsBatch,
    reorderTodoProjectsBatch,
    deleteTodoItem,
    dispatchTodoToAgent,
    undispatchTodoItem,
    fetchTodoSpaceTree,
} from './todo.js'

export {
    // 个人笔记
    fetchNoteTree,
    createNote,
    fetchNote,
    updateNote,
    renameNote,
    moveNote,
    deleteNote,
    fetchOrCreateBoundNote,
    shareNote,
    fetchSharedNote,
    fetchFavorites,
    favoriteNote,
    unfavoriteNote,
    // 个人 Agent
    fetchPersonalAgents,
    // 员工搜索
    searchScheduleStaff,
    // 群聊场景
    fetchScenarioInstances,
    createScenarioInstance,
    // 图片上传
    uploadChatImage,
    uploadChatImages,
} from './crossdomain.js'
