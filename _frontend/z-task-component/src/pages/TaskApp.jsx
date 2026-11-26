import {Navigate, Route, Routes} from 'react-router-dom'
import Dashboard from './Dashboard'
import TaskList from './task/TaskList'
import TaskEdit from './task/TaskEdit'
import ProjectList from './project/ProjectList'
import UserList from './user/UserList'

/**
 * /z-task/* 的子路由容器。
 *
 * pages-manifest.jsx 里 dashboard / task / project / user 四条路由的 Component 是 null，
 * 由 App 壳展开成这个容器（同 z-mist 的 MistApp、z-wf 的 WorkflowApp）。
 * 菜单第一项落在 task 而不是 dashboard：任务管理是本域主入口。
 */
export default function TaskApp() {
    return (
        <Routes>
            <Route index element={<Navigate to="task" replace/>}/>
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="task" element={<TaskList/>}/>
            <Route path="task/edit/:id?" element={<TaskEdit/>}/>
            <Route path="project" element={<ProjectList/>}/>
            <Route path="user" element={<UserList/>}/>
        </Routes>
    )
}
