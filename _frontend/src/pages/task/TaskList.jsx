import {useEffect, useState} from 'react'
import {Button, Card, Input, message, Select, Space, Table, Tag} from 'antd'
import {EditOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons'
import {useNavigate} from 'react-router-dom'
import {completeTask, getTaskListByList, reopenTask} from '../../services/api'

const {Search} = Input
const {Option} = Select

const statusMap = {
    0: {color: 'gold', text: '待办'},
    1: {color: 'blue', text: '进行中'},
    2: {color: 'green', text: '已完成'}
}

const priorityMap = {
    0: {color: 'green', text: '低'},
    1: {color: 'gold', text: '中'},
    2: {color: 'orange', text: '高'},
    3: {color: 'red', text: '紧急'}
}

export default function TaskList() {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedListId, setSelectedListId] = useState(null)

    const loadTasks = async (listId) => {
        if (!listId) return
        setLoading(true)
        try {
            const res = await getTaskListByList(listId)
            setTasks(res.data || [])
        } catch (e) {
            message.error('加载任务失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (selectedListId) {
            loadTasks(selectedListId)
        }
    }, [selectedListId])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: '任务名称',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                const info = priorityMap[priority] || {color: 'default', text: String(priority)}
                return <Tag color={info.color}>{info.text}</Tag>
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const info = statusMap[status] || {color: 'default', text: String(status)}
                return <Tag color={info.color}>{info.text}</Tag>
            }
        },
        {
            title: '截止日期',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => date || '-'
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined/>} onClick={() => navigate(`/task/edit/${record.id}`)}>
                        编辑
                    </Button>
                    {record.status === 2 ? (
                        <Button type="link" onClick={() => handleReopen(record.id)}>重新打开</Button>
                    ) : (
                        <Button type="link" onClick={() => handleComplete(record.id)}>完成</Button>
                    )}
                </Space>
            )
        }
    ]

    const handleComplete = async (taskId) => {
        try {
            await completeTask(taskId)
            message.success('任务已完成')
            loadTasks(selectedListId)
        } catch (e) {
            message.error('操作失败')
        }
    }

    const handleReopen = async (taskId) => {
        try {
            await reopenTask(taskId)
            message.success('任务已重新打开')
            loadTasks(selectedListId)
        } catch (e) {
            message.error('操作失败')
        }
    }

    return (
        <Card
            title="任务管理"
            extra={
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate('/task/edit/new')}>
                    新建任务
                </Button>
            }
        >
            <div style={{marginBottom: 16, display: 'flex', gap: 16}}>
                <Select
                    placeholder="选择列表"
                    style={{width: 200}}
                    onChange={(val) => setSelectedListId(val)}
                    allowClear
                >
                    <Option value={1}>待办</Option>
                    <Option value={2}>进行中</Option>
                    <Option value={3}>已完成</Option>
                </Select>
                <Search
                    placeholder="搜索任务名称"
                    allowClear
                    enterButton={<SearchOutlined/>}
                    style={{width: 300}}
                />
            </div>
            <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                loading={loading}
            />
        </Card>
    )
}
