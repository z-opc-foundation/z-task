/**
 * 任务表格组件
 *
 * §2 列表页三件套由基座 ListTable 一次到位（分页 + 过滤 + EmptyState），
 * 本仓不再手写 pagination={{...}}，避免各页分页参数口径分裂。
 */
import {Button, Space, Tag} from 'antd'
import {CheckCircleOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons'
import {ListTable} from '@yuku123/z-frontend-common/ui'

const priorityMap = {high: 'red', medium: 'orange', low: 'green'}
const statusMap = {
    pending: 'default',
    in_progress: 'blue',
    completed: 'green',
}

export default function TaskTable({dataSource, loading, onEdit, onDelete, onComplete}) {
    const columns = [
        {title: '任务名称', dataIndex: 'title', key: 'title'},
        {title: '项目', dataIndex: 'projectName', key: 'projectName'},
        {
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
            render: (v) => <Tag color={priorityMap[v]}>{v === 'high' ? '高' : v === 'medium' ? '中' : '低'}</Tag>,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (v) => {
                const m = {pending: '待处理', in_progress: '进行中', completed: '已完成'}
                return <Tag color={statusMap[v]}>{m[v] || v}</Tag>
            },
        },
        {title: '截止日期', dataIndex: 'dueDate', key: 'dueDate'},
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status !== 'completed' && (
                        <Button size="small" icon={<CheckCircleOutlined/>} onClick={() => onComplete?.(record)}>
                            完成
                        </Button>
                    )}
                    <Button size="small" icon={<EditOutlined/>} onClick={() => onEdit?.(record)}>
                        编辑
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined/>} onClick={() => onDelete?.(record)}>
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <ListTable
            columns={columns}
            rows={dataSource}
            loading={loading}
            rowKey="id"
            searchKeys="title,projectName"
            searchPlaceholder="按任务名称 / 项目过滤"
            emptyDescription="当前还没有任务"
        />
    )
}