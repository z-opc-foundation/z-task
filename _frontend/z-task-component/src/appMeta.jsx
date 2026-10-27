import { AppstoreOutlined, DashboardOutlined, HomeOutlined, ReadOutlined } from '@ant-design/icons'

/**
 * 应用级常量单独成模块。
 *
 * 不能留在 pages-manifest.jsx 里：HomePage 要 import menuItems，而 manifest 又 import HomePage，
 * 构成 pages-manifest → HomePage → pages-manifest 的循环。menuItems 是模块初始化期求值的
 * const，循环会让它落进 TDZ，浏览器报 "Cannot access 'X' before initialization"，
 * 整页白屏且控制台无日志。拆出来环就断了。
 */
export const appMeta = { title: 'z-task 任务管理', short: 'z-task' }

export const menuItems = [
    { key: '/z-task/home', label: '首页', icon: <HomeOutlined /> },
    { key: '/z-task/dashboard', label: '仪表盘', desc: '任务量、完成率与近期趋势', icon: <DashboardOutlined /> },
    { key: '/z-task/task', label: '任务管理', desc: '任务列表、状态流转与负责人', icon: <AppstoreOutlined /> },
    { key: '/z-task/project', label: '项目管理', desc: '按项目归置任务与进度', icon: <AppstoreOutlined /> },
    { key: '/z-task/user', label: '用户管理', desc: '成员账号与角色', icon: <AppstoreOutlined /> },
    { key: '/z-task/docs', label: '组件文档', icon: <ReadOutlined /> },
]
