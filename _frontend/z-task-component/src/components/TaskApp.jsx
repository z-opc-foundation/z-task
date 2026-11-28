import {Navigate, useLocation} from 'react-router-dom'
import ProjectList from './ProjectList'
import TaskList from './TaskList'
import TaskDashboard from './TaskDashboard'
import SpaceItems from './SpaceItems'

/**
 * 任务中心 (从 z-opc-main-starter-frontend/src/pages/task/index.jsx 迁入).
 *
 * 页面段: dashboard / project / task / space/<projectId>
 *   （2026-11-28 CEO 口径：项目任务其之下有工作空间，空间之下有一大堆事项 ——
 *    `space/<id>` 落 {@link SpaceItems}，即「一个空间看它全部事项」的那层）
 *
 * 嵌入契约（对齐 z-qa QAApp / z-product ProductApp，2026-11-28）：**不用嵌套 <Routes>** ——
 * 宿主按 pathname 直接渲染本组件（系统面 SystemShell 的 /task/* Route、z-team 产品面的
 * 原位内嵌），嵌套 Routes 的相对段在剩余路径下匹配不到。按 mountPath 切出剩余段自己
 * 分发，两种宿主形态表现一致；宿主只传 mountPath，无需感知本域内部路由。
 *
 * @param mountPath 本域在宿主里的挂载前缀（缺省 /task；z-team 产品面传 /product/task）
 */
export default function TaskApp({mountPath = '/task'}) {
    const {pathname} = useLocation()
    const rest = pathname.startsWith(mountPath) ? pathname.slice(mountPath.length) : pathname
    const segs = rest.split('/').filter(Boolean)
    const seg = segs[0] ?? ''
    switch (seg) {
        case 'dashboard':
            return <TaskDashboard/>
        case 'project':
            return <ProjectList/>
        case 'task':
            return <TaskList/>
        case 'space': {
            // /space/<projectId> → 该工作空间的事项页；没带 id 就回总览
            const pid = segs[1]
            if (pid) return <SpaceItems key={pid} projectId={pid}/>
            return <Navigate to={`${mountPath}/dashboard`} replace/>
        }
        default:
            // /task、/task/ 等裸挂载 → 落默认页（与旧 index 的 Navigate to="dashboard" 等效）
            return <Navigate to={`${mountPath}/dashboard`} replace/>
    }
}
