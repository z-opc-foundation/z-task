import HomePage from './pages/HomePage'
import TaskApp from './pages/TaskApp.jsx'
import ComponentDocPage from './pages/ComponentDoc.jsx'

/**
 * 路由清单（lead 008 §10/§14/§16 批量落地）。App 壳在 suit 侧组装。
 *
 * appMeta / menuItems 已挪到 ./appMeta.js —— 它们原本在这里、而 HomePage 又回头 import
 * menuItems，模块循环让 menuItems 落进 TDZ，浏览器报 "Cannot access 'X' before
 * initialization" 整页白屏。页面组件直接在本文件 import，不要绕道 pages.js 再转发。
 */
export {appMeta, menuItems} from './appMeta.jsx'

/**
 * dashboard / task / project / user 四条路由的 Component 留 null，实际由 TaskApp
 * 这个嵌套路由壳接管（见 pages/TaskApp.jsx），所以 suit 侧渲染 null 路由时跳过。
 */
export const routes = [
    { path: '/z-task/home', Component: HomePage },
    { path: '/z-task/dashboard', Component: null },
    { path: '/z-task/task', Component: null },
    { path: '/z-task/task/edit/:id?', Component: null },
    { path: '/z-task/project', Component: null },
    { path: '/z-task/user', Component: null },
    { path: '/z-task/docs', Component: ComponentDocPage },
    { path: '/z-task/:rest*', Component: TaskApp },
]

export const isAuthenticated = () => !!localStorage.getItem('token')

export {default as Dashboard} from './pages/Dashboard'
export {default as Login} from './pages/Login'
export {default as HomePage} from './pages/HomePage'
export {default as LoginPage} from './pages/LoginPage'
export {default as ProjectList} from './pages/project/ProjectList'
export {default as TaskList} from './pages/task/TaskList'
export {default as TaskEdit} from './pages/task/TaskEdit'
export {default as UserList} from './pages/user/UserList'
// 主壳接线用：文档页统一以 ComponentDocPage 这个名字从主入口导出。
export {default as ComponentDocPage} from './pages/ComponentDoc.jsx'
