import {useEffect, useState} from 'react'
import {Button, Descriptions, Drawer, Popconfirm, Space, Tag, Typography} from 'antd'
import {CheckOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons'
import {taskApi} from '../api'

const {Paragraph} = Typography

const STATUS_MAP = {
    0: {label: '待办', color: 'default'},
    1: {label: '进行中', color: 'blue'},
    2: {label: '已完成', color: 'green'},
}

const PRIORITY_MAP = {
    1: {label: '低', color: 'default'},
    2: {label: '中', color: 'orange'},
    3: {label: '高', color: 'red'},
}

/**
 * 任务详情 Drawer
 *
 * Props:
 *   - taskId: number        任务 ID
 *   - open: boolean         是否打开
 *   - onClose: () => void   关闭回调
 *   - onChanged: () => void 数据变更后刷新列表
 *   - onEdit: (task) => void 点击编辑
 */
export default function TaskDetailDrawer({taskId, open, onClose, onChanged, onEdit}) {
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open || !taskId) return
        setLoading(true)
        taskApi.getTaskDetail(taskId)
            .then(res => setTask(res?.data || res))
            .catch(() => setTask(null))
            .finally(() => setLoading(false))
    }, [open, taskId])

    const handleComplete = async () => {
        try {
            await taskApi.completeTask(taskId)
            setTask(prev => ({...prev, status: 2}))
            onChanged?.()
        } catch { /* ignore */
        }
    }

    const handleDelete = async () => {
        try {
            await taskApi.deleteTask(taskId)
            onChanged?.()
            onClose?.()
        } catch { /* ignore */
        }
    }

    const status = STATUS_MAP[task?.status] || STATUS_MAP[0]
    const priority = PRIORITY_MAP[task?.priority] || PRIORITY_MAP[1]

    return (
        <Drawer
            title={task?.title || '任务详情'}
            size="large"
            open={open}
            onClose={onClose}
            loading={loading}
            footer={
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Popconfirm
                        title="确认删除此任务?"
                        onConfirm={handleDelete}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{danger: true}}
                    >
                        <Button danger icon={<DeleteOutlined/>}>删除</Button>
                    </Popconfirm>
                    <Space>
                        {task?.status !== 2 && (
                            <Button type="primary" icon={<CheckOutlined/>} onClick={handleComplete}>
                                完成任务
                            </Button>
                        )}
                        <Button icon={<EditOutlined/>} onClick={() => onEdit?.(task)}>
                            编辑
                        </Button>
                    </Space>
                </div>
            }
        >
            {task && (
                <>
                    <Descriptions column={2} bordered size="small" style={{marginBottom: 24}}>
                        <Descriptions.Item label="状态">
                            <Tag color={status.color}>{status.label}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="优先级">
                            <Tag color={priority.color}>{priority.label}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="项目 ID">{task.projectId}</Descriptions.Item>
                        <Descriptions.Item label="列表 ID">{task.listId}</Descriptions.Item>
                        <Descriptions.Item label="截止时间" span={2}>
                            {task.dueDate || '未设置'}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建时间">{task.createdAt || '-'}</Descriptions.Item>
                        <Descriptions.Item label="更新时间">{task.updatedAt || '-'}</Descriptions.Item>
                    </Descriptions>

                    {task.description && (
                        <div style={{marginBottom: 24}}>
                            <div style={{fontWeight: 600, marginBottom: 8}}>描述</div>
                            <Paragraph style={{whiteSpace: 'pre-wrap', color: '#595959'}}>
                                {task.description}
                            </Paragraph>
                        </div>
                    )}
                </>
            )}
        </Drawer>
    )
}
