export const isAuthenticated = () => !!localStorage.getItem('token')

export const menuItems = [
    {key: '/', label: '仪表盘'},
    {key: '/task', label: '任务管理'},
    {key: '/project', label: '项目管理'},
    {key: '/user', label: '用户管理'},
]

const routeTable = [
    {path: 'dashboard', Component: null},  // 占位，下面赋值
    {path: 'task', Component: null},
    {path: 'task/edit/:id?', Component: null},
    {path: 'project', Component: null},
    {path: 'user', Component: null},
]

// 延迟绑定：先 import 页面再注入 routeTable.Component
import Dashboard from './pages/Dashboard'
import TaskList from './pages/task/TaskList'
import TaskEdit from './pages/task/TaskEdit'
import ProjectList from './pages/project/ProjectList'
import UserList from './pages/user/UserList'
routeTable[0].Component = Dashboard
routeTable[1].Component = TaskList
routeTable[2].Component = TaskEdit
routeTable[3].Component = ProjectList
routeTable[4].Component = UserList

export {routeTable}
export {default as Dashboard} from './pages/Dashboard'
export {default as Login} from './pages/Login'
export {default as ProjectList} from './pages/project/ProjectList'
export {default as TaskList} from './pages/task/TaskList'
export {default as TaskEdit} from './pages/task/TaskEdit'
export {default as UserList} from './pages/user/UserList'
