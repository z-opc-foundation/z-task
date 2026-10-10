export const isAuthenticated = () => !!localStorage.getItem('token')



// 延迟绑定：先 import 页面再注入 routes.Component
import Dashboard from './pages/Dashboard'
import TaskList from './pages/task/TaskList'
import TaskEdit from './pages/task/TaskEdit'
import ProjectList from './pages/project/ProjectList'
import UserList from './pages/user/UserList'
routes[0].Component = Dashboard
routes[1].Component = TaskList
routes[2].Component = TaskEdit
routes[3].Component = ProjectList
routes[4].Component = UserList

export {default as Dashboard} from './pages/Dashboard'
export {default as Login} from './pages/Login'
export {default as ProjectList} from './pages/project/ProjectList'
export {default as TaskList} from './pages/task/TaskList'
export {default as TaskEdit} from './pages/task/TaskEdit'
export {default as UserList} from './pages/user/UserList'
import { AppstoreOutlined, DashboardOutlined, HomeOutlined } from '@ant-design/icons'
import HomePage from './pages/HomePage'

/** 菜单 + 路由清单（lead 008 §10/§14/§16 批量落地）。App 壳在 suit 侧组装。 */
export const appMeta = { title: 'z-task 任务管理', short: 'z-task' }

export const menuItems = [
    { key: '/z-task/home', label: '首页', icon: <HomeOutlined /> },
    { key: '/z-task/overview', label: '仪表盘', icon: <DashboardOutlined /> },
    { key: '/z-task/task', label: '任务管理', icon: <AppstoreOutlined /> },
    { key: '/z-task/project', label: '项目管理', icon: <AppstoreOutlined /> },
    { key: '/z-task/user', label: '用户管理', icon: <AppstoreOutlined /> },
]

export const routes = [
    { path: '/z-task/home', Component: HomePage },
    { path: '/z-task/dashboard', Component: null },
    { path: '/z-task/task', Component: null },
    { path: '/z-task/task/edit/:id?', Component: null },
    { path: '/z-task/project', Component: null },
    { path: '/z-task/user', Component: null },
]

export { default as HomePage } from './pages/HomePage'
export { default as LoginPage } from './pages/LoginPage'
