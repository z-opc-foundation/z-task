import {useEffect, useRef, useState} from 'react'
import {Alert, Button, message, Select, Space, Tag} from 'antd'
import {PlusOutlined} from '@ant-design/icons'
import {useNavigate} from 'react-router-dom'
import {ListTable} from '@yuku123/z-frontend-common/ui'
import {completeTask, getProjectListByUser, getTaskListByProject, reopenTask} from '../../services/api'

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
    const [projects, setProjects] = useState([])
    const [projectLoading, setProjectLoading] = useState(true)
    const [projectError, setProjectError] = useState('')
    const [projectRetry, setProjectRetry] = useState(0)
    const [selectedProjectId, setSelectedProjectId] = useState()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [refresh, setRefresh] = useState(0)
    const [pendingId, setPendingId] = useState(null)
    const submitting = useRef(false)

    useEffect(() => {
        let active = true
        setProjectLoading(true)
        setProjectError('')
        getProjectListByUser().then(data => {
            if (!active) return
            setProjects(data)
            setSelectedProjectId(current => current ?? data[0]?.id)
        }).catch(error => {
            if (active) setProjectError(error.message || '加载项目失败')
        }).finally(() => {
            if (active) setProjectLoading(false)
        })
        return () => { active = false }
    }, [projectRetry])

    useEffect(() => {
        let active = true
        setTasks([])
        setError('')
        setLoading(selectedProjectId != null)
        if (selectedProjectId != null) {
            getTaskListByProject(selectedProjectId).then(data => {
                if (active) setTasks(data)
            }).catch(error => {
                if (active) setError(error.message || '加载任务失败')
            }).finally(() => {
                if (active) setLoading(false)
            })
        }
        return () => { active = false }
    }, [selectedProjectId, refresh])

    const changeStatus = async (record) => {
        if (submitting.current) return
        submitting.current = true
        setPendingId(record.id)
        try {
            await (record.status === 2 ? reopenTask(record.id) : completeTask(record.id))
            message.success(record.status === 2 ? '任务已重新打开' : '任务已完成')
            setRefresh(value => value + 1)
        } catch (error) {
            message.error(error.message || '操作失败')
        } finally {
            submitting.current = false
            setPendingId(null)
        }
    }

    const columns = [
        {title: 'ID', dataIndex: 'id', key: 'id', width: 80},
        {title: '任务名称', dataIndex: 'title', key: 'title'},
        {
            title: '优先级', dataIndex: 'priority', key: 'priority',
            render: (priority) => {
                const info = priorityMap[priority] || {color: 'default', text: String(priority)}
                return <Tag color={info.color}>{info.text}</Tag>
            }
        },
        {
            title: '状态', dataIndex: 'status', key: 'status',
            render: (status) => {
                const info = statusMap[status] || {color: 'default', text: String(status)}
                return <Tag color={info.color}>{info.text}</Tag>
            }
        },
        {title: '截止日期', dataIndex: 'dueDate', key: 'dueDate', render: date => date || '-'},
        {
            title: '操作', key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={() => {
                        const query = new URLSearchParams()
                        if (record.projectId != null) query.set('projectId', record.projectId)
                        if (record.listId != null) query.set('listId', record.listId)
                        navigate(`edit/${record.id}?${query}`)
                    }}>详情</Button>
                    <Button type="link" size="small" loading={pendingId === record.id}
                            disabled={pendingId != null} onClick={() => changeStatus(record)}>
                        {record.status === 2 ? '重新打开' : '完成'}
                    </Button>
                </Space>
            )
        }
    ]

    return (
        <div>
            {projectError && <Alert type="error" showIcon title={projectError} style={{marginBottom: 16}}
                                    action={<Button onClick={() => setProjectRetry(value => value + 1)}>重试</Button>}/>}
            <div style={{marginBottom: 16}}>
                <Select placeholder="选择项目" style={{width: 240}} value={selectedProjectId}
                        loading={projectLoading} disabled={projectLoading || pendingId != null}
                        onChange={setSelectedProjectId} allowClear
                        options={projects.map(project => ({value: project.id, label: project.name}))}/>
            </div>
            {error && <Alert type="error" showIcon title={error} style={{marginBottom: 16}}
                             action={<Button onClick={() => setRefresh(value => value + 1)}>重试</Button>}/>}
            <ListTable columns={columns} rows={tasks} rowKey="id" loading={loading || projectLoading}
                       cardTitle="任务管理" cardExtra={
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate('edit/new')}>新建任务</Button>
            } searchKeys="title" searchPlaceholder="搜索任务名称"
                       emptyDescription={selectedProjectId == null ? '请选择项目查看任务' : '该项目下还没有任务'}/>
        </div>
    )
}
