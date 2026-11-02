import React from 'react'
import ReactDOM from 'react-dom/client'
import {ConfigProvider} from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

/**
 * ⚠ 组件包的 CSS **必须由宿主显式引入**。
 *
 * vite 的 lib 模式会把 `*.module.css` 抽成**独立文件**（`dist/<pkg>.css`），
 * JS 入口里不会留 `import './xxx.css'` —— 这是 lib 模式与 app 模式的关键差异。
 * 宿主只 import JS 的话，页面上组件结构在、样式全丢：
 * 表现为「类名都在，但卡片没有边框、选项卡是裸链接」。
 *
 * ⇒ 两个包的 style.css 都要引，且**顺序有讲究**：
 *   1. markdown 包在前（它含 vditor 的基础样式，TodoTab 的覆盖类要压在它上面）；
 *   2. 待办组件包在后。
 */
import '@yuku123/z-markdown-component/style.css'
import '@yuku123/z-task-component/style.css'

// Router 只由 App 提供 —— 这里再包一层 BrowserRouter 会让 App 里的那个变成
// "Router inside Router"，react-router 直接抛错，整页只剩一段红字。
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider locale={zhCN}>
            <App/>
        </ConfigProvider>
    </React.StrictMode>,
)
