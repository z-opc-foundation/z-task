import {useEffect, useState} from 'react'
import {Alert, Button, Card, Col, Row, Statistic} from 'antd'
import {CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined} from '@ant-design/icons'
import {getTaskListByAssignee} from '../services/api'

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        todo: 0,
        doing: 0,
        done: 0,
        cancelled: 0
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [retry, setRetry] = useState(0)

    useEffect(() => {
        let active = true
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const userId = localStorage.getItem('userId')
                if (!userId) throw new Error('缺少当前用户信息，请重新登录')
                const tasks = await getTaskListByAssignee(userId)
                if (active) setStats({
                    total: tasks.length,
                    todo: tasks.filter(t => t.status === 0).length,
                    doing: tasks.filter(t => t.status === 1).length,
                    done: tasks.filter(t => t.status === 2).length,
                    cancelled: tasks.filter(t => t.status === 3).length
                })
            } catch (error) {
                if (active) setError(error.message || '加载任务统计失败')
            } finally {
                if (active) setLoading(false)
            }
        }
        load()
        return () => { active = false }
    }, [retry])

    return (
        <div className="ztask-page-root">
            <h1 style={{margin: 0}}>仪表盘</h1>
            {error && <Alert className="ztask-flat-block" type="error" showIcon title={error} style={{marginBottom: -1}}
                             action={<Button onClick={() => setRetry(value => value + 1)}>重试</Button>}/>}
            <Row className="ztask-dashboard-stats" gutter={0}>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="总任务数"
                            value={stats.total}
                            prefix={<FileTextOutlined style={{color: 'var(--zfc-primary)'}}/>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="待办"
                            value={stats.todo}
                            prefix={<ClockCircleOutlined style={{color: '#faad14'}}/>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="进行中"
                            value={stats.doing}
                            prefix={<FileTextOutlined style={{color: 'var(--zfc-primary)'}}/>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="已完成"
                            value={stats.done}
                            prefix={<CheckCircleOutlined style={{color: '#52c41a'}}/>}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
