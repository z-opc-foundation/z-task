import {useEffect, useState} from 'react'
import {Button, Form, Input, message, Modal, Space, Tag} from 'antd'
import {EditOutlined, PlusOutlined} from '@ant-design/icons'
import {ListTable} from '@yuku123/z-frontend-common/ui'
import {archiveProject, createProject, getProjectListByUser} from '../../services/api'

const statusMap = {
    0: {color: 'default', text: '已归档'},
    1: {color: 'green', text: '进行中'}
}

export default function ProjectList() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [form] = Form.useForm()

    const loadProjects = async () => {
        setLoading(true)
        try {
            const userId = localStorage.getItem('userId') || '1'
            const res = await getProjectListByUser(userId)
            setProjects(res.data || [])
        } catch (e) {
            message.error('加载项目失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const handleCreate = async () => {
        try {
            const values = await form.validateFields()
            await createProject(values)
            message.success('创建成功')
            setModalVisible(false)
            form.resetFields()
            loadProjects()
        } catch (e) {
            message.error('创建失败')
        }
    }

    const handleArchive = async (projectId) => {
        try {
            await archiveProject(projectId)
            message.success('归档成功')
            loadProjects()
        } catch (e) {
            message.error('归档失败')
        }
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: '项目名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '项目描述',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-'
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
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt'
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined/>}>
                        编辑
                    </Button>
                    {record.status === 1 && (
                        <Button type="link" danger onClick={() => handleArchive(record.id)}>
                            归档
                        </Button>
                    )}
                </Space>
            )
        }
    ]

    return (
        <div>
            {/* Card + Table 合成基座 ListTable 一件：分页 / 过滤 / EmptyState 三件套一次到位，
                「新建项目」按钮落在 cardExtra（与过滤框并排） */}
            <ListTable
                columns={columns}
                rows={projects}
                rowKey="id"
                loading={loading}
                cardTitle="项目管理"
                cardExtra={
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => setModalVisible(true)}>
                        新建项目
                    </Button>
                }
                searchKeys="name,description"
                searchPlaceholder="按项目名称 / 描述过滤"
                emptyDescription="还没有项目，新建一个开始组织任务"
            />

            <Modal
                title="新建项目"
                open={modalVisible}
                onOk={handleCreate}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields()
                }}
                okText="创建"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="项目名称" rules={[{required: true, message: '请输入项目名称'}]}>
                        <Input placeholder="请输入项目名称"/>
                    </Form.Item>
                    <Form.Item name="description" label="项目描述">
                        <Input.TextArea placeholder="请输入项目描述" rows={3}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
