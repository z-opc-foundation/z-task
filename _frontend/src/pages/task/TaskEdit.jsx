import {useEffect, useState} from 'react'
import {Button, Card, DatePicker, Form, Input, message, Select, Space} from 'antd'
import {useNavigate, useParams} from 'react-router-dom'

const {Option} = Select

// 后端状态值: 0=低,1=中,2=高,3=紧急
const priorityOptions = [
    {value: 0, label: '低'},
    {value: 1, label: '中'},
    {value: 2, label: '高'},
    {value: 3, label: '紧急'}
]

// 后端状态值: 0=待办,1=进行中,2=已完成
const statusOptions = [
    {value: 0, label: '待办'},
    {value: 1, label: '进行中'},
    {value: 2, label: '已完成'}
]

export default function TaskEdit() {
    const navigate = useNavigate()
    const {id} = useParams()
    const isEdit = id !== 'new'
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true)
            // TODO: 获取项目列表后找到当前任务对应的项目
            // 暂时从 localStorage 取 userId 加载项目任务
            setLoading(false)
        }
    }, [id, isEdit])

    const onFinish = async (values) => {
        try {
            // TODO: 调用 createTask 或 updateTask
            message.success(isEdit ? '任务更新成功' : '任务创建成功')
            navigate('/task')
        } catch (e) {
            message.error(isEdit ? '更新失败' : '创建失败')
        }
    }

    return (
        <Card title={isEdit ? '编辑任务' : '新建任务'}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    status: 0,
                    priority: 1
                }}
            >
                <Form.Item
                    name="title"
                    label="任务名称"
                    rules={[{required: true, message: '请输入任务名称'}]}
                >
                    <Input placeholder="请输入任务名称"/>
                </Form.Item>

                <Form.Item
                    name="projectId"
                    label="所属项目"
                    rules={[{required: true, message: '请选择所属项目'}]}
                >
                    <Select placeholder="请选择项目" allowClear>
                        {/* TODO: 从项目列表接口加载 */}
                        <Option value={1}>Z-Task项目</Option>
                        <Option value={2}>Z-Config项目</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="listId"
                    label="所属列表"
                    rules={[{required: true, message: '请选择列表'}]}
                >
                    <Select placeholder="请选择列表">
                        <Option value={1}>待办</Option>
                        <Option value={2}>进行中</Option>
                        <Option value={3}>已完成</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="priority"
                    label="优先级"
                >
                    <Select>
                        {priorityOptions.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="status"
                    label="状态"
                >
                    <Select>
                        {statusOptions.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="dueDate"
                    label="截止日期"
                >
                    <DatePicker style={{width: '100%'}}/>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="任务描述"
                >
                    <Input.TextArea rows={4} placeholder="请输入任务描述"/>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {isEdit ? '更新' : '创建'}
                        </Button>
                        <Button onClick={() => navigate('/task')}>
                            取消
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    )
}
