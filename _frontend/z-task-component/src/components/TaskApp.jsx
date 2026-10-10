import {Navigate, Route, Routes} from 'react-router-dom'
import ProjectList from './ProjectList'
import TaskList from './TaskList'
import TaskDashboard from './TaskDashboard'

/**
 * 任务中心 (从 z-opc-main-starter-frontend/src/pages/task/index.jsx 迁入).
 *
 * 路由: /task/dashboard, /task/project, /task/task (保持与原前端一致, 兼容菜单 key)
 */
export default function TaskApp() {
    return (
        <Routes>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<TaskDashboard/>}/>
            <Route path="project" element={<ProjectList/>}/>
            <Route path="project/*" element={<ProjectList/>}/>
            <Route path="task" element={<TaskList/>}/>
            <Route path="task/*" element={<TaskList/>}/>
        </Routes>
    )
}
