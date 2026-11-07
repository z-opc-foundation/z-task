import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {safeEmptyOutDir} from '../../build-tools/safe-vite-plugin.mjs'

/**
 * z-task 独立运行壳的 dev 配置。
 *
 * <h3>为什么需要 `/z-team/api` 这条代理</h3>
 * 待办（TodoTab）的前端请求**统一打 z-team 的 Facade**（见
 * `src/services/core.js` 的 BASE = `/z-team/api`）：
 * 待办数据在 z-task，但「派发编排」与 5 类跨域能力（个人笔记 / 个人 Agent /
 * 员工搜索 / 群聊场景 / 图片上传）归属 z-team。
 * ⇒ 走 z-team 一条基址，读写 + 派发 + 跨域全齐，且与生产 nginx 的
 *   `/z-team/api/` 规则一致，本地和生产不会分叉。
 *
 * <h3>两种本地跑法</h3>
 * 1. **默认（对齐生产）**：z-team 后端起在 8888 ⇒ `/z-team/api` 原样转发。
 *    这是验证派发与跨域能力的唯一路径。
 * 2. **`ZTASK_DIRECT=1`（只验待办读写）**：把 `/z-team/api` **重写**到
 *    z-task 的 `/api`。省掉起 z-team 的重量级依赖（SB2 + Java 8）。
 *    ⚠ 代价：`/todo/items/{id}/dispatch`（z-team 口径）在 z-task 侧不存在
 *      （那边叫 `dispatch-agent`，且只回写绑定不真正派发）⇒ 派发按钮会 404；
 *      5 类跨域能力同理。**只能用来验列表 / 详情 / 增删改。**
 */
const ZTEAM_TARGET = process.env.ZTEAM_TARGET || 'http://localhost:8888'
const ZTASK_TARGET = process.env.ZTASK_TARGET || 'http://127.0.0.1:8082'
const DIRECT_TO_ZTASK = process.env.ZTASK_DIRECT === '1'

const zteamProxy = DIRECT_TO_ZTASK
    ? {
        target: ZTASK_TARGET,
        changeOrigin: true,
        // /z-team/api/todo/... → /api/todo/...
        rewrite: (p) => p.replace(/^\/z-team\/api/, '/api'),
    }
    : {target: ZTEAM_TARGET, changeOrigin: true}

export default defineConfig({
    plugins: [safeEmptyOutDir(), react()],
    resolve: {
        /**
         * 2026-11-07：z-task-component 内兄弟包（@yuku123/z-markdown-component 等）以
         * symlink 形式挂在 suit/node_modules。vite 默认 follow symlink ⇒ 解析沿
         * realpath（../z-task-component/...）向上找 node_modules ⇒ 兄弟包解析失败。
         * preserveSymlinks 让模块查找以 symlink 所在处（suit/node_modules）为基准。
         */
        preserveSymlinks: true,
        // react / antd / dayjs 必须 dedupe：组件包走软链（本地兄弟仓）时，
        // 否则会出现「一份在 z-task-component/node_modules、一份在 suit/node_modules」
        // ⇒ 双实例 React ⇒ Invalid hook call；dayjs 双实例则让 antd 的 locale 失效。
        dedupe: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons', 'axios', 'dayjs'],
        alias: process.env.LOCAL_SIBLINGS === '1' ? {'@yuku123/z-task-component': '../z-task-component/src'} : {},
    },
    server: {
        port: 3009,
        fs: {allow: ['..']},
        proxy: {
            '/api': {target: 'http://localhost:8888', changeOrigin: true},
            '/z-team/api': zteamProxy,
        },
    },
})
