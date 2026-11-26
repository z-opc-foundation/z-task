import {Button, Card, Form, Input, message} from 'antd'
import {LockOutlined, UserOutlined} from '@ant-design/icons'
import {useNavigate} from 'react-router-dom'
import request from '../services/request'
import './Login.css'

export default function Login() {
    const navigate = useNavigate()

    const onFinish = async (values) => {
        try {
            // 后端返回 { code, success, data: { token, userId, userName, expiresIn } }
            // axios 响应拦截器（utils/request.js）已经把外层 response.data 拆开，
            // 所以 `res` 就是 { data: { token, ... }, success, code }。token 在 res.data 下。
            const res = await request.post('/auth/login', values)
            const token = res?.data?.token ?? res?.token
            const userId = res?.data?.userId ?? res?.userId
            if (token) localStorage.setItem('token', token)
            if (userId != null) localStorage.setItem('userId', String(userId))
            if (!token) {
                message.error('登录响应缺少 token')
                return
            }
            message.success('登录成功')
            navigate('/')
        } catch (error) {
            message.error('登录失败：' + (error.response?.data?.message || error.message))
        }
    }

    return (
        <div className="login-container">
            <Card title="欢迎登录 Z-Task" className="login-card">
                <Form
                    name="login"
                    initialValues={{remember: true}}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[{required: true, message: '请输入用户名!'}]}
                    >
                        <Input prefix={<UserOutlined/>} placeholder="用户名" size="large"/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{required: true, message: '请输入密码!'}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined/>}
                            placeholder="密码"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}
