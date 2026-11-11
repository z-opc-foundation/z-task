import {useEffect, useMemo, useState} from 'react'
import {
    Button,
    Card,
    Descriptions,
    Drawer,
    Empty,
    Form,
    Input,
    List,
    message,
    Popconfirm,
    Select,
    Space,
    Spin,
    Tag
} from 'antd'
import {
    CheckOutlined,
    InboxOutlined,
    PlusOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import {ListTable} from '@yuku123/z-frontend-common/ui'
import {taskApi} from '../api'

/** 格式化日期为 2026-06-18T15:27:00 (去掉毫秒/时区) */
const formatDateTime = (val) => {
    if (!val) return '-'
    const s = String(val)
    const m = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/)
    return m ? m[1] : s
}

/**
 * 项目管理 (从 z-opc-main-starter-frontend/src/pages/task/project/ProjectList.jsx 迁入).
 *
 * Props:
 *   - apiBaseURL?: string  后端 baseURL, 默认 '/api'
 */
export default function ProjectList({apiBaseURL}) {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [editDrawerOpen, setEditDrawerOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [viewing, setViewing] = useState(null)
    const [tasks, setTasks] = useState([])
    const [tasksLoading, setTasksLoading] = useState(false)
    const [form] = Form.useForm()

    const load = async () => {
        setLoading(true)
        try {
            const res = await taskApi.listMyProjects()
            setProjects(res?.data || res || [])
        } catch (e) {
            message.error('加载项目失败: ' + (e?.message || e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    // lead 008 §2 规则 3：客户端查询过滤（taskApi.listMyProjects() 一次取回本人项目，过滤在端侧做）。
    // 参与匹配的字段取自本页 listColumns 真实存在的 dataIndex：name / status / createdAt。
    const [keyword, setKeyword] = useState('')
    const filteredProjects = useMemo(() => {
        const kw = keyword.trim().toLowerCase()
        if (!kw) return projects
        return projects.filter((p) => `${p.name || ''} ${p.status ?? ''} ${p.createdAt || ''}`.toLowerCase().includes(kw))
    }, [projects, keyword])

    const onViewProject = async (row) => {
        setViewing(row)
        setTasksLoading(true)
        try {
            const res = await taskApi.listTasksByProject(row.id)
            setTasks(res?.data || res || [])
        } catch (e) {
            message.error('加载任务失败: ' + (e?.message || e))
        } finally {
            setTasksLoading(false)
        }
    }

    const refreshTasks = async () => {
        if (!viewing) return
        try {
            const res = await taskApi.listTasksByProject(viewing.id)
            setTasks(res?.data || res || [])
        } catch (e) {
            message.error('刷新任务失败: ' + (e?.message || e))
        }
    }

    const onCreate = () => {
        setEditing(null)
        form.resetFields()
        form.setFieldsValue({status: 1})
        setEditDrawerOpen(true)
    }

    const onEdit = (row) => {
        setEditing(row)
        form.setFieldsValue({name: row.name, description: row.description, status: row.status ?? 1})
        setEditDrawerOpen(true)
    }

    const onSubmit = async () => {
        try {
            const values = await form.validateFields()
            if (editing) {
                await taskApi.updateProject(editing.id, values)
                message.success('项目已更新')
            } else {
                await taskApi.createProject(values)
                message.success('项目已创建')
            }
            setEditDrawerOpen(false)
            load()
        } catch (e) {
            if (e?.errorFields) return
            message.error('保存失败: ' + (e?.message || e))
        }
    }

    const onArchive = async (id) => {
        try {
            await taskApi.archiveProject(id)
            message.success('项目已归档')
            load()
            if (viewing?.id === id) {
                setViewing(null)
                setTasks([])
            }
        } catch (e) {
            message.error('归档失败: ' + (e?.message || e))
        }
    }

    const onCompleteTask = async (id) => {
        try {
            await taskApi.completeTask(id)
            message.success('任务已完成')
            refreshTasks()
        } catch (e) {
            message.error('操作失败: ' + (e?.message || e))
        }
    }

    const listColumns = [
        {
            title: '项目名称', dataIndex: 'name',
            render: (text, row) => (
                <a
                    onClick={() => onViewProject(row)}
                    style={{fontWeight: viewing?.id === row.id ? 600 : 400}}
                >
                    {text}
                </a>
            ),
        },
        {
            title: '状态', dataIndex: 'status', width: 80,
            render: (s) => s === 1 ? <Tag color="green">进行中</Tag> : <Tag>已归档</Tag>,
        },
        {title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime},
        {
            title: '操作', width: 160, fixed: 'right',
            render: (_, row) => (
                <Space>
                    <Button type="link" size="small" onClick={() => onEdit(row)}>编辑</Button>
                    <Popconfirm title="确定归档该项目?" onConfirm={() => onArchive(row.id)}>
                        <Button type="link" size="small" danger>归档</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const renderStatusTag = (s) => {
        const map = {
            0: {text: '待办', color: 'default'},
            1: {text: '进行中', color: 'blue'},
            2: {text: '已完成', color: 'green'}
        }
        const cfg = map[s] || {text: String(s), color: 'default'}
        return <Tag color={cfg.color}>{cfg.text}</Tag>
    }

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 12}}>
                <Button type="primary" icon={<PlusOutlined/>} onClick={onCreate}>新建项目</Button>
            </div>

            <div style={{display: 'flex', gap: 16, height: 'calc(100vh - 220px)'}}>
                {/* 左栏项目表：Card + Table 合成基座 ListTable 一件（分页/空态两件套），
                    查询过滤框按 lead 008 §2 规则 3 挂在 cardExtra 里（端侧过滤 filteredProjects），
                    卡片外观沿用原来的 size="small" + 固定宽度，避免左右分栏布局被撑开 */}
                <ListTable
                    rows={filteredProjects}
                    columns={listColumns}
                    loading={loading}
                    rowKey="id"
                    cardTitle={<Space><InboxOutlined/>项目管理</Space>}
                    cardExtra={
                        <Space>
                            <Input.Search allowClear placeholder="按项目名称 / 状态 / 创建时间过滤" style={{width: 240}}
                                          onChange={(e) => setKeyword(e.target.value)}/>
                        </Space>
                    }
                    cardProps={{
                        size: 'small',
                        style: {width: 520, flexShrink: 0},
                        styles: {body: {padding: 8, overflow: 'auto', height: 'calc(100% - 40px)'}},
                    }}
                    tableProps={{
                        rowClassName: (row) => viewing?.id === row.id ? 'ant-table-row-selected' : '',
                        onRow: (row) => ({onClick: () => onViewProject(row), style: {cursor: 'pointer'}}),
                    }}
                    emptyDescription="还没有项目，新建一个开始组织任务"
                />

                <Card
                    size="small"
                    style={{flex: 1, overflow: 'auto'}}
                    styles={{body: {padding: 16}}}
                    title={
                        viewing ? (
                            <Space>
                                <UnorderedListOutlined/>
                                {viewing.name} · 任务列表
                            </Space>
                        ) : '项目详情'
                    }
                >
                    {!viewing ? (
                        <Empty description="请从左侧选择一个项目" style={{marginTop: 80}}/>
                    ) : (
                        <Spin spinning={tasksLoading}>
                            <Descriptions size="small" bordered column={2} style={{marginBottom: 16}}>
                                <Descriptions.Item label="项目名称" span={2}>{viewing.name}</Descriptions.Item>
                                <Descriptions.Item label="描述" span={2}>
                                    {viewing.description || '无'}
                                </Descriptions.Item>
                                <Descriptions.Item label="负责人">{viewing.ownerId || '未指定'}</Descriptions.Item>
                                <Descriptions.Item label="状态">
                                    {viewing.status === 1
                                        ? <Tag color="green">进行中</Tag>
                                        : <Tag>已归档</Tag>}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="创建时间">{formatDateTime(viewing.createdAt)}</Descriptions.Item>
                                <Descriptions.Item label="项目ID">{viewing.id}</Descriptions.Item>
                            </Descriptions>

                            <List
                                size="small"
                                header={<b>任务项 ({tasks.length})</b>}
                                bordered
                                dataSource={tasks}
                                locale={{emptyText: '该项目下暂无任务'}}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                key="complete"
                                                size="small"
                                                type="primary"
                                                icon={<CheckOutlined/>}
                                                disabled={item.status === 2}
                                                onClick={() => onCompleteTask(item.id)}
                                            >
                                                完成
                                            </Button>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <Space>
                                                    {item.title}
                                                    {renderStatusTag(item.status)}
                                                    <Tag>优先级 {item.priority ?? '-'}</Tag>
                                                </Space>
                                            }
                                            description={
                                                <span style={{color: '#888', fontSize: 12}}>
                                                    截止: {formatDateTime(item.dueDate)} · ID: {item.id}
                                                </span>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Spin>
                    )}
                </Card>
            </div>

            <Drawer
                title={editing ? `编辑项目 - ${editing.name}` : '新建项目'}
                size="large"
                open={editDrawerOpen}
                onClose={() => setEditDrawerOpen(false)}
                destroyOnHidden
                extra={
                    <Space>
                        <Button onClick={() => setEditDrawerOpen(false)}>取消</Button>
                        <Button type="primary" onClick={onSubmit}>保存</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item name="name" label="项目名称" rules={[{required: true, message: '请输入项目名称'}]}>
                        <Input placeholder="例如: 一人公司"/>
                    </Form.Item>
                    <Form.Item name="description" label="项目描述">
                        <Input.TextArea rows={3} placeholder="可选"/>
                    </Form.Item>
                    <Form.Item name="status" label="状态" initialValue={1}>
                        <Select
                            options={[
                                {label: '进行中', value: 1},
                                {label: '已归档', value: 0},
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    )
}
