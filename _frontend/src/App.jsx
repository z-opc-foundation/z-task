import {Route, Routes, useNavigate} from 'react-router-dom'
import {AppLayout} from '@yuku123/z-frontend-common'
import {Button, message} from 'antd'
import {LogoutOutlined} from '@ant-design/icons'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/task/TaskList'
import TaskEdit from './pages/task/TaskEdit'
import ProjectList from './pages/project/ProjectList'
import UserList from './pages/user/UserList'
import Login from './pages/Login'
import './App.css'

const menuItems = [
    {key: '/', label: '仪表盘'},
    {key: '/task', label: '任务管理'},
    {key: '/project', label: '项目管理'},
    {key: '/user', label: '用户管理'},
]

function App() {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        message.success('已退出登录')
        navigate('/login')
    }
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/" element={
                <AppLayout
                    menuItems={menuItems}
                    appTitle="Z-Task 任务管理系统"
                    appShort="TASK"
                    headerExtra={
                        <Button
                            type="text"
                            icon={<LogoutOutlined/>}
                            onClick={handleLogout}
                        >
                            退出登录
                        </Button>
                    }
                />
            }>
                <Route index element={<Dashboard/>}/>
                <Route path="task" element={<TaskList/>}/>
                <Route path="task/edit/:id" element={<TaskEdit/>}/>
                <Route path="project" element={<ProjectList/>}/>
                <Route path="user" element={<UserList/>}/>
            </Route>
        </Routes>
    )
}

export default App
