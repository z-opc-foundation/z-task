import {useEffect} from 'react'
import {DatePicker, Form, Input, message, Modal, Select} from 'antd'
import {taskApi} from '../api'

/**
 * 任务编辑 Modal
 *
 * Props:
 *   - open: boolean           是否打开
 *   - task: object | null     任务对象 (null = 新建)
 *   - projects: array         项目列表
 *   - onClose: () => void     关闭回调
 *   - onSaved: () => void     保存成功回调
 */
export default function TaskEditModal({open, task, projects, onClose, onSaved}) {
    const [form] = Form.useForm()
    const isEdit = !!task?.id

    useEffect(() => {
        if (open && task) {
            form.setFieldsValue({
                title: task.title,
                description: task.description,
                projectId: task.projectId,
                listId: task.listId,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
            })
        } else if (open) {
            form.resetFields()
        }
    }, [open, task, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (isEdit) {
                await taskApi.updateTask(task.id, values)
                message.success('任务已更新')
            } else {
                await taskApi.createTask(values)
                message.success('任务已创建')
            }
            onSaved?.()
            onClose?.()
        } catch (e) {
            if (e?.errorFields) return
            message.error('保存失败: ' + (e?.message || e))
        }
    }

    return (
        <Modal
            title={isEdit ? '编辑任务' : '新建任务'}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            destroyOnHidden
            size="large"
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item
                    name="title"
                    label="任务标题"
                    rules={[{required: true, message: '请输入任务标题'}]}
                >
                    <Input placeholder="例如: 实现 xx 功能"/>
                </Form.Item>

                <Form.Item name="description" label="描述">
                    <Input.TextArea rows={3} placeholder="任务描述 (可选)"/>
                </Form.Item>

                <div style={{display: 'flex', gap: 16}}>
                    <Form.Item
                        name="projectId"
                        label="所属项目"
                        rules={[{required: true}]}
                        style={{flex: 1}}
                    >
                        <Select
                            options={projects.map(p => ({label: p.name, value: p.id}))}
                            placeholder="选择项目"
                        />
                    </Form.Item>

                    <Form.Item name="listId" label="列表 ID" style={{flex: 1}}>
                        <Input type="number" placeholder="默认 1"/>
                    </Form.Item>
                </div>

                <div style={{display: 'flex', gap: 16}}>
                    <Form.Item name="status" label="状态" initialValue={0} style={{flex: 1}}>
                        <Select
                            options={[
                                {label: '待办', value: 0},
                                {label: '进行中', value: 1},
                                {label: '已完成', value: 2},
                            ]}
                        />
                    </Form.Item>

                    <Form.Item name="priority" label="优先级" initialValue={1} style={{flex: 1}}>
                        <Select
                            options={[
                                {label: '低', value: 1},
                                {label: '中', value: 2},
                                {label: '高', value: 3},
                            ]}
                        />
                    </Form.Item>
                </div>

                <Form.Item name="dueDate" label="截止时间">
                    <DatePicker style={{width: '100%'}} placeholder="选择截止日期"/>
                </Form.Item>
            </Form>
        </Modal>
    )
}
