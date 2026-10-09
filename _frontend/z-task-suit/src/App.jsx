import {Navigate, Route, Routes} from 'react-router-dom'
import {AppLayout} from '@yuku123/z-frontend-common'
import {Dashboard, Login, menuItems, routeTable, isAuthenticated} from '@yuku123/z-task-component/pages'

const PrivateRoute = ({children}) => isAuthenticated() ? children : <Navigate to="/login" replace/>

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/" element={
                <PrivateRoute>
                    <AppLayout menuItems={menuItems} appTitle="z-task 任务管理" appShort="TASK"/>
                </PrivateRoute>
            }>
                {routeTable.map((r) => (
                    <Route key={r.path} path={r.path} element={<r.Component/>}/>
                ))}
            </Route>
        </Routes>
    )
}
