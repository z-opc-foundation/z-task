/**
 * z-task 子页菜单清单（2026-11-28 CEO「项目任务」口径）。
 *
 * 为什么单独成一个零依赖入口（dist/menu.js）：宿主侧栏（产研面 /product/task/*、
 * 系统面 /task/*）要引用这份菜单，但 z-task 的页面代码体量不小 ——
 * 从包根拿会把 TaskApp 连带拖进宿主主 chunk。
 * 这个入口只含纯数据，宿主 import 它不沾任何 React 代码（对齐 z-qa 的 menu.ts）。
 *
 * key 与 TaskApp 内 switch 的分发段一一对应（见 components/TaskApp.jsx），
 * 宿主拼前缀即可：/product/task/dashboard、/task/dashboard 都命中同一个页面。
 * `space/<projectId>` 是动态段：工作空间清单由宿主经 taskApi.listMyProjects()
 * 拉取后逐项拼 `{mountPath}/space/{id}`（见下 TASK_SPACE_PATH_SEGMENT）。
 *
 * @typedef {{key: string, label: string, title?: string}} TaskSubMenuItem
 */

/** @type {TaskSubMenuItem[]} */
export const TASK_SUB_MENU = [
    {key: 'dashboard', label: '任务总览', title: '任务统计与推进分布'},
    {key: 'space', label: '工作空间', title: '工作空间清单（动态）：一个空间一堆事项，落到 space/<id>'},
    {key: 'task', label: '全部事项', title: '跨空间的全部事项列表'},
    {key: 'project', label: '空间管理', title: '工作空间（项目）的创建 / 归档 / 成员'},
];

/** 动态工作空间项的路径段（宿主拼 `space/<id>`） */
export const TASK_SPACE_PATH_SEGMENT = 'space';

/**
 * 拼某工作空间的完整路径：mountPath + space/<id>（宿主侧栏用）。
 * @param {string} mountPath 本域挂载前缀（如 /task、/product/task）
 * @param {string|number} projectId 工作空间（项目）id
 */
export function taskSpacePath(mountPath, projectId) {
    return `${mountPath}/${TASK_SPACE_PATH_SEGMENT}/${projectId}`;
}
