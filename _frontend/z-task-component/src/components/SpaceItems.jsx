import {useEffect, useMemo, useState} from 'react'
import {Button, message, Space, Spin, Tag} from 'antd'
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import {taskApi} from '../api'
import {ErrorState, ListTable, PageHeader, TableToolbar} from '@yuku123/z-frontend-common/ui'
import TaskDetailDrawer from './TaskDetailDrawer'
import TaskEditModal from './TaskEditModal'

/**
 * 工作空间事项页（2026-11-28 CEO 口径）：
 *
 * 「产研 tab 里，task 是独立一个大菜单，叫项目任务；其之下有工作空间，
 *   空间之下将会有一大堆事项」—— 本页就是「空间之下的事项」那一层：
 *   一个工作空间（z-task 项目）进来看它的全部事项。
 *
 * 参考 z-demo/c2f/feature-team 的 fone 工作项形态：工单空间 → 大量工作项
 * （fone 侧 /kapi/eip-fone/workItem/**），这里落成 z-task 的
 * 项目（{@link taskApi.listMyProjects}）→ 事项（{@link taskApi.listTasksByProject}）。
 *
 * 路由契约：TaskApp 按 `space/<projectId>` 分发到本页 ⇒ 宿主侧栏的
 * 工作空间项直接拼 `{mountPath}/space/{id}` 即可，两层宿主（系统面 /task、
 * z-team 产品面 /product/task）表现一致。
 *
 * Props:
 *   - projectId: number | string  工作空间 id（必填；缺省渲染引导空态）
 */
export default function SpaceItems({projectId}) {
    const [projects, setProjects] = useState([])
    const [space, setSpace] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)

    /** 项目清单（编辑弹窗的「所属项目」下拉 + 当前空间名回显） */
    const loadProjects = async () => {
        try {
            const res = await taskApi.listMyProjects()
            const list = res?.data || res || []
            setProjects(list)
            setSpace(list.find((p) => String(p.id) === String(projectId)) ?? null)
        } catch (e) {
            // 空间名只是回显增强，失败不阻断事项列表
            setProjects([])
        }
    }

    const loadTasks = async () => {
        if (!projectId) return
        setLoading(true)
        setLoadError(null)
        try {
            const res = await taskApi.listTasksByProject(projectId)
            setTasks(res?.data || res || [])
        } catch (e) {
            setLoadError(e?.message || '加载事项失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])
    useEffect(() => {
        loadTasks()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    const openCreate = () => {
        setSelectedTask(null)
        setCreateOpen(true)
    }

    const onComplete = async (id) => {
        try {
            await taskApi.completeTask(id)
            message.success('事项已完成')
            loadTasks()
        } catch (e) {
            message.error('操作失败: ' + (e?.message || e))
        }
    }

    // 状态统计条：一眼看清这个空间里事项的推进分布
    const stats = useMemo(() => {
        const c = {0: 0, 1: 0, 2: 0}
        for (const t of tasks) c[t.status] = (c[t.status] ?? 0) + 1
        return c
    }, [tasks])

    const columns = [
        {title: 'ID', dataIndex: 'id', width: 60},
        {title: '标题', dataIndex: 'title'},
        {
            title: '状态', dataIndex: 'status', width: 100,
            render: (s) => {
                const map = {0: '待办', 1: '进行中', 2: '已完成'}
                const color = {0: 'default', 1: 'blue', 2: 'green'}[s] || 'default'
                return <Tag color={color}>{map[s] || s}</Tag>
            },
        },
        {
            title: '优先级', dataIndex: 'priority', width: 90,
            render: (p) => {
                const map = {1: '低', 2: '中', 3: '高'}
                const color = {1: 'green', 2: 'orange', 3: 'red'}[p] || 'default'
                return <Tag color={color}>{map[p] || p}</Tag>
            },
        },
        {title: '截止时间', dataIndex: 'dueDate', width: 180},
        {
            title: '操作', width: 200, fixed: 'right',
            render: (_, row) => (
                <Space>
                    <Button type="link" size="small"
                            onClick={() => {
                                setSelectedTask(row)
                                setDetailOpen(true)
                            }}>
                        查看
                    </Button>
                    <Button size="small" type="primary"
                            onClick={() => onComplete(row.id)}
                            disabled={row.status === 2}>
                        完成
                    </Button>
                </Space>
            ),
        },
    ]

    const spaceName = space?.name || (projectId ? `工作空间 #${projectId}` : '')

    if (!projectId) {
        return (
            <div>
                <PageHeader title="工作空间事项" breadcrumb={[{label: '项目任务'}, {label: '工作空间'}]}/>
                <ListTable rows={[]} columns={columns} rowKey="id"
                           emptyTitle="未指定工作空间" emptyDescription="从左侧「项目任务」菜单选一个工作空间"/>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={spaceName}
                breadcrumb={[{label: '项目任务'}, {label: '工作空间'}, {label: spaceName || String(projectId)}]}
            />
            <TableToolbar
                left={
                    <Space size="middle">
                        <Tag>待办 {stats[0] ?? 0}</Tag>
                        <Tag color="blue">进行中 {stats[1] ?? 0}</Tag>
                        <Tag color="green">已完成 {stats[2] ?? 0}</Tag>
                        <Button size="small" icon={<ReloadOutlined/>} onClick={() => void (loadProjects(), loadTasks())}>
                            刷新
                        </Button>
                    </Space>
                }
                right={
                    <Button type="primary" icon={<PlusOutlined/>} onClick={openCreate}>
                        新建事项
                    </Button>
                }
            />

            {loadError && (
                <div style={{marginBottom: 16}}>
                    <ErrorState error={loadError} onRetry={loadTasks} title="加载事项失败"/>
                </div>
            )}
            {loading && tasks.length === 0 && !loadError ? (
                <div style={{textAlign: 'center', padding: 48}}><Spin/></div>
            ) : (
                <ListTable
                    rows={tasks}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    searchKeys="title"
                    searchPlaceholder="按事项标题过滤"
                    emptyTitle={loadError ? undefined : '这个空间下还没有事项'}
                    emptyDescription={loadError ? undefined : '把目标拆解成可执行的事项，一项项推进'}
                    emptyActionText={loadError ? undefined : '新建第一个事项'}
                    emptyOnAction={loadError ? undefined : openCreate}
                />
            )}

            {/* 新建事项：默认锁定当前空间（TaskEditModal.defaultProjectId，仍可改选） */}
            <TaskEditModal
                open={createOpen || editOpen}
                task={editOpen ? selectedTask : null}
                projects={projects}
                defaultProjectId={projectId}
                onClose={() => {
                    setCreateOpen(false)
                    setEditOpen(false)
                    setSelectedTask(null)
                }}
                onSaved={loadTasks}
            />

            <TaskDetailDrawer
                taskId={selectedTask?.id}
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false)
                    setSelectedTask(null)
                }}
                onChanged={loadTasks}
                onEdit={(t) => {
                    setSelectedTask(t)
                    setDetailOpen(false)
                    setEditOpen(true)
                }}
            />
        </div>
    )
}
