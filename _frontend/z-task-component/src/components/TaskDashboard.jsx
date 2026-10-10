import {useEffect, useState} from 'react'
import {Card, Col, Empty, List, Progress, Row, Select, Space, Spin, Statistic, Tag, Typography} from 'antd'
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    ReloadOutlined,
    RocketOutlined
} from '@ant-design/icons'
import {taskApi} from '../api'

/**
 * 任务中心 - 仪表盘
 *
 * 数据来源:
 *   - GET /api/project/user/list           — 我的项目列表
 *   - GET /api/task/project/list?projectId= — 项目下的任务
 */
const {Text, Title} = Typography

const STATUS_MAP = {
    0: {text: '待办', color: 'default', icon: <ClockCircleOutlined/>},
    1: {text: '进行中', color: 'blue', icon: <RocketOutlined/>},
    2: {text: '已完成', color: 'green', icon: <CheckCircleOutlined/>},
}

export default function TaskDashboard({apiBaseURL}) {
    const [projects, setProjects] = useState([])
    const [projectId, setProjectId] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [projectsLoading, setProjectsLoading] = useState(false)

    const loadProjects = async () => {
        setProjectsLoading(true)
        try {
            const res = await taskApi.listMyProjects()
            const list = res?.data || res || []
            setProjects(list)
            if (list.length > 0 && !projectId) setProjectId(list[0].id)
        } catch {
            setProjects([])
        } finally {
            setProjectsLoading(false)
        }
    }

    const loadTasks = async (pid) => {
        if (!pid) {
            setTasks([]);
            return
        }
        setLoading(true)
        try {
            const res = await taskApi.listTasksByProject(pid)
            setTasks(res?.data || res || [])
        } catch {
            setTasks([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])
    useEffect(() => {
        loadTasks(projectId)
    }, [projectId])

    // 统计
    const stats = tasks.reduce((acc, t) => {
        acc.total += 1
        const s = t.status ?? 0
        if (s === 0) acc.todo += 1
        else if (s === 1) acc.doing += 1
        else if (s === 2) acc.done += 1
        return acc
    }, {total: 0, todo: 0, doing: 0, done: 0})

    const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

    // 按优先级分组
    const byPriority = [1, 2, 3].map(p => ({
        priority: p,
        list: tasks.filter(t => (t.priority ?? 1) === p),
    }))

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Card>
                <Space wrap>
                    <ProjectOutlined style={{fontSize: 18, color: '#1677ff'}}/>
                    <Text strong>选择项目：</Text>
                    <Select
                        value={projectId}
                        onChange={setProjectId}
                        style={{width: 280}}
                        loading={projectsLoading}
                        placeholder="选择项目"
                        options={projects.map(p => ({label: p.name, value: p.id}))}
                    />
                    <a onClick={() => loadProjects()}><ReloadOutlined/> 刷新项目</a>
                </Space>
            </Card>

            <Spin spinning={loading}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic title="总任务数" value={stats.total}/>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="待办" value={stats.todo}
                                       styles={{content: {color: '#8c8c8c'}}}
                                       prefix={<ClockCircleOutlined/>}/>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="进行中" value={stats.doing}
                                       styles={{content: {color: '#1677ff'}}}
                                       prefix={<RocketOutlined/>}/>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="已完成" value={stats.done}
                                       styles={{content: {color: '#52c41a'}}}
                                       prefix={<CheckCircleOutlined/>}/>
                        </Card>
                    </Col>
                </Row>

                <Card style={{marginTop: 16}} title="完成率">
                    <Progress percent={completionRate} status={completionRate === 100 ? 'success' : 'active'}/>
                </Card>

                <Row gutter={16} style={{marginTop: 16}}>
                    {byPriority.map(({priority, list}) => (
                        <Col span={8} key={priority}>
                            <Card size="small" title={
                                <Space>
                                    <Tag color={priority === 3 ? 'red' : priority === 2 ? 'orange' : 'default'}>
                                        {priority === 3 ? '高' : priority === 2 ? '中' : '低'}
                                    </Tag>
                                    <span>优先级 ({list.length})</span>
                                </Space>
                            }>
                                {list.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无任务"/>
                                ) : (
                                    <List
                                        size="small"
                                        dataSource={list.slice(0, 8)}
                                        renderItem={t => {
                                            const s = STATUS_MAP[t.status ?? 0] || STATUS_MAP[0]
                                            return (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={s.icon}
                                                        title={
                                                            <Space>
                                                                <Text>{t.title}</Text>
                                                                <Tag color={s.color} style={{margin: 0}}>{s.text}</Tag>
                                                            </Space>
                                                        }
                                                        description={t.dueDate ? `截止: ${t.dueDate}` : '无截止时间'}
                                                    />
                                                </List.Item>
                                            )
                                        }}
                                    />
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Spin>
        </div>
    )
}