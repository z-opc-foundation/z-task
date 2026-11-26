/**
 * 任务卡片组件
 */
import {Button, Card, Space, Tag} from 'antd'
import {CheckCircleOutlined, EditOutlined} from '@ant-design/icons'

const priorityMap = {
    high: {color: 'red', text: '高'},
    medium: {color: 'orange', text: '中'},
    low: {color: 'green', text: '低'},
}

const statusMap = {
    pending: {color: 'default', text: '待处理'},
    in_progress: {color: 'blue', text: '进行中'},
    completed: {color: 'green', text: '已完成'},
}

export default function TaskCard({task, onEdit, onComplete}) {
    const priority = priorityMap[task.priority] || {color: 'default', text: task.priority}
    const status = statusMap[task.status] || {color: 'default', text: task.status}

    return (
        <Card size="small" title={task.title} extra={
            <Space>
                {task.status !== 'completed' && (
                    <Button size="small" icon={<CheckCircleOutlined/>} onClick={() => onComplete?.(task)}>
                        完成
                    </Button>
                )}
                <Button size="small" icon={<EditOutlined/>} onClick={() => onEdit?.(task)}>
                    编辑
                </Button>
            </Space>
        }>
            <Space orientation="vertical" style={{width: '100%'}}>
                <div>项目：{task.projectName}</div>
                <Space>
                    <Tag color={priority.color}>{priority.text}</Tag>
                    <Tag color={status.color}>{status.text}</Tag>
                </Space>
                {task.dueDate && <div>截止：{task.dueDate}</div>}
            </Space>
        </Card>
    )
}