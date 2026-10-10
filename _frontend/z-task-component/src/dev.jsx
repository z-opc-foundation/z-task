/**
 * Task组件库开发调试入口
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import {ProjectSelect, TaskCard, TaskTable} from './index.js'

const App = () => {
    const tasks = [
        {
            id: 1,
            title: '完成登录页',
            projectName: '主应用',
            priority: 'high',
            status: 'in_progress',
            dueDate: '2024-06-10'
        },
        {
            id: 2,
            title: '修复菜单问题',
            projectName: '主应用',
            priority: 'medium',
            status: 'pending',
            dueDate: '2024-06-15'
        },
        {
            id: 3,
            title: '上线审批流程',
            projectName: '流程引擎',
            priority: 'low',
            status: 'completed',
            dueDate: '2024-06-01'
        },
    ]
    const projects = [{id: 1, name: '主应用'}, {id: 2, name: '流程引擎'}]

    return (
        <div style={{padding: 20}}>
            <h1>Task 组件库 Dev</h1>
            <h2>TaskCard 示例</h2>
            <TaskCard task={tasks[0]} onEdit={(t) => console.log('edit', t)}
                      onComplete={(t) => console.log('complete', t)}/>

            <h2>TaskTable 示例</h2>
            <TaskTable
                dataSource={tasks}
                loading={false}
                onEdit={(t) => console.log('edit', t)}
                onDelete={(t) => console.log('delete', t)}
                onComplete={(t) => console.log('complete', t)}
            />

            <h2>ProjectSelect 示例</h2>
            <ProjectSelect projects={projects} onChange={(v) => console.log('select', v)}/>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)