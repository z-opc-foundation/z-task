import {useEffect, useState} from 'react'
import {Card, Table, Tag} from 'antd'

// z-task 的用户来自 z-ctc SSO 同步，无独立 CRUD
// 前端 UserList 只做展示（只读），由 z-ctc 统一管理用户
export default function UserList() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // TODO: 调用 z-ctc 用户同步接口 /api/ctc/account/page
        // 当前用户数据由 SSO 同步写入 z_sync_user 表
        // 这里临时用空列表，因为 z-task 本身不管理用户
        setUsers([])
    }, [])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: '昵称',
            dataIndex: 'nickname',
            key: 'nickname',
            render: (text) => text || '-'
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? '启用' : '禁用'}
                </Tag>
            )
        },
        {
            title: '来源',
            dataIndex: 'source',
            key: 'source',
            render: (text) => text || '-'
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt'
        }
    ]

    return (
        <Card title="用户管理">
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                locale={{emptyText: '暂无数据（用户由 z-ctc 统一管理）'}}
            />
        </Card>
    )
}
