import {useEffect, useState} from 'react'
import {Button, Form, Input, message, Modal, Select, Space, Tag} from 'antd'
import {CheckOutlined, EyeOutlined, PlusOutlined} from '@ant-design/icons'
import {taskApi} from '../api'
import {ErrorState, ListTable, PageHeader, TableToolbar} from '@yuku123/z-frontend-common/ui'
import TaskDetailDrawer from './TaskDetailDrawer'
import TaskEditModal from './TaskEditModal'

/**
 * 任务管理 - 交互修复:
 *   - PageHeader 替代 Card title, 标题/操作/返回更清晰
 *   - 错误就近显示 (ErrorState), 不用全局 message
 *   - 空状态 EmptyState 引导下一步
 *
 * Props:
 *   - apiBaseURL?: string  后端 baseURL, 默认 '/api'
 *   - back?: boolean       是否显示返回按钮
 */
export default function TaskList({apiBaseURL, back}) {
    const [projects, setProjects] = useState([])
    const [projectId, setProjectId] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState(null)
    const [projectLoadError, setProjectLoadError] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [form] = Form.useForm()

    const loadProjects = async () => {
        try {
            const res = await taskApi.listMyProjects()
            const list = res?.data || res || []
            setProjects(list)
            setProjectLoadError(null)
            if (list.length > 0 && !projectId) setProjectId(list[0].id)
        } catch (e) {
            setProjectLoadError(e?.message || '加载项目失败')
        }
    }

    const loadTasks = async (pid) => {
        if (!pid) {
            setTasks([])
            return
        }
        setLoading(true)
        setLoadError(null)
        try {
            const res = await taskApi.listTasksByProject(pid)
            setTasks(res?.data || res || [])
        } catch (e) {
            setLoadError(e?.message || '加载任务失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        loadTasks(projectId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    const onCreate = () => {
        if (!projectId) {
            message.warning('请先选择项目')
            return
        }
        form.resetFields()
        form.setFieldsValue({projectId, listId: 1, status: 1, priority: 1})
        setModalOpen(true)
    }

    const onSubmit = async () => {
        try {
            const values = await form.validateFields()
            await taskApi.createTask(values)
            message.success('任务已创建')
            setModalOpen(false)
            loadTasks(projectId)
        } catch (e) {
            if (e?.errorFields) return
            message.error('创建失败: ' + (e?.message || e))
        }
    }

    const onComplete = async (id) => {
        try {
            await taskApi.completeTask(id)
            message.success('任务已完成')
            loadTasks(projectId)
        } catch (e) {
            message.error('操作失败: ' + (e?.message || e))
        }
    }

    const columns = [
        {title: 'ID', dataIndex: 'id', width: 60},
        {title: '标题', dataIndex: 'title'},
        {title: '项目ID', dataIndex: 'projectId', width: 80},
        {
            title: '状态', dataIndex: 'status', width: 100,
            render: (s) => {
                const map = {0: '待办', 1: '进行中', 2: '已完成'}
                const color = {0: 'default', 1: 'blue', 2: 'green'}[s] || 'default'
                return <Tag color={color}>{map[s] || s}</Tag>
            },
        },
        {title: '优先级', dataIndex: 'priority', width: 80},
        {title: '截止时间', dataIndex: 'dueDate', width: 180},
        {
            title: '操作', width: 200, fixed: 'right',
            render: (_, row) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined/>}
                            onClick={() => {
                                setSelectedTask(row);
                                setDetailOpen(true)
                            }}>
                        查看
                    </Button>
                    <Button size="small" type="primary" icon={<CheckOutlined/>}
                            onClick={() => onComplete(row.id)}
                            disabled={row.status === 2}>
                        完成
                    </Button>
                </Space>
            ),
        },
    ]

    // 空态话术只在「已选项目 + 无错误 + 加载完成 + 该项目下确实没有任务」时才提示去建任务；
    // 未选项目 / 加载失败时退回通用空态，避免在不该建任务的场景里误导用户。
    const isProjectEmpty = !loading && !loadError && !!projectId && tasks.length === 0

    return (
        <div>
            <PageHeader
                title="任务管理"
                breadcrumb={[{label: '任务中心'}, {label: '任务列表'}]}
                back={!!back}
            />
            <TableToolbar
                left={
                    <Select
                        value={projectId}
                        onChange={setProjectId}
                        style={{width: 240}}
                        placeholder="选择项目"
                        options={projects.map(p => ({label: p.name, value: p.id}))}
                    />
                }
                right={<Button type="primary" icon={<PlusOutlined/>} onClick={onCreate}>新建任务</Button>}
            />

            {projectLoadError && (
                <div style={{marginBottom: 16}}>
                    <ErrorState error={projectLoadError} onRetry={loadProjects}
                                title="加载项目列表失败"/>
                </div>
            )}
            {loadError && (
                <div style={{marginBottom: 16}}>
                    <ErrorState error={loadError} onRetry={() => loadTasks(projectId)}/>
                </div>
            )}

            {/* 任务表：原来的「白底 div + Table」合成基座 ListTable 一件
                （分页 + 过滤 + EmptyState 三件套一次到位），空态话术保持原样 */}
            <ListTable
                rows={tasks}
                columns={columns}
                loading={loading}
                rowKey="id"
                searchKeys="title"
                searchPlaceholder="按任务标题过滤"
                emptyTitle={isProjectEmpty ? '该项目下还没有任务' : '暂无数据'}
                emptyDescription={isProjectEmpty ? '把目标拆解成可执行的任务, 一项项推进' : undefined}
                emptyActionText={isProjectEmpty ? '新建第一个任务' : undefined}
                emptyOnAction={isProjectEmpty ? onCreate : undefined}
            />

            <Modal
                title="新建任务"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={onSubmit}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item name="title" label="任务标题" rules={[{required: true, message: '请输入任务标题'}]}>
                        <Input placeholder="例如: 实现 xx 功能"/>
                    </Form.Item>
                    <Form.Item name="projectId" label="所属项目" rules={[{required: true}]}>
                        <Select
                            options={projects.map(p => ({label: p.name, value: p.id}))}
                            placeholder="从数据库捞出的项目列表"
                        />
                    </Form.Item>
                    <Form.Item name="listId" label="列表ID" rules={[{required: true}]}>
                        <Input type="number" placeholder="默认 1"/>
                    </Form.Item>
                    <Form.Item name="priority" label="优先级" initialValue={1}>
                        <Select options={[{label: '低', value: 1}, {label: '中', value: 2}, {label: '高', value: 3}]}/>
                    </Form.Item>
                </Form>
            </Modal>

            <TaskDetailDrawer
                taskId={selectedTask?.id}
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedTask(null)
                }}
                onChanged={loadTasks}
                onEdit={(t) => {
                    setSelectedTask(t);
                    setDetailOpen(false);
                    setEditOpen(true)
                }}
            />

            <TaskEditModal
                open={editOpen}
                task={selectedTask}
                projects={projects}
                onClose={() => {
                    setEditOpen(false);
                    setSelectedTask(null)
                }}
                onSaved={loadTasks}
            />
        </div>
    )
}
