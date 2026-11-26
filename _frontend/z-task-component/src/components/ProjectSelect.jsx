/**
 * 项目选择器组件
 */
import {Select} from 'antd'

export default function ProjectSelect({value, onChange, projects = []}) {
    return (
        <Select
            value={value}
            onChange={onChange}
            placeholder="请选择项目"
            style={{width: 200}}
            allowClear
        >
            {projects.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                    {p.name}
                </Select.Option>
            ))}
        </Select>
    )
}