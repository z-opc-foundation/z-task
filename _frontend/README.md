# z-task 前端

本目录按 lead 005 §9 的「组件 + 独立壳（suit）」两件套组织，两个子工程各自独立、
不合并成一个前端仓：

| 子工程 | npm 名 | 版本 | 角色 |
|---|---|---|---|
| [`z-task-component/`](z-task-component/) | `@yuku123/z-task-component` | 0.1.0 | 可复用页面集（manifest + 自洽 request + api） |
| [`z-task-suit/`](z-task-suit/) | `@yuku123/z-task-suit`（private，不发布） | 0.1.0 | 独立运行壳：AppLayout + 鉴权 + manifest 路由 |

## 常用命令

```bash
# 壳：本地起 dev server（端口 3009，/api 代理到 http://localhost:8888）
cd z-task-suit && npm install && npm run dev

# 壳：构建（先构建 component，再构建壳）
cd z-task-suit && npm run build

# 组件：单独构建（产出 dist/，供壳与其它宿主消费）
cd z-task-component && npm install && npm run build

# 联调本地组件源码（不发布即用）：LOCAL_SIBLINGS=1 会把
# '@yuku123/z-task-component' 别名到 ../z-task-component/src
cd z-task-suit && LOCAL_SIBLINGS=1 npm run dev
```

`z-task-suit` 的 `npm run build` 会先跑 `build:component`（进 `../z-task-component`
装依赖并出 `dist/`），所以**构建壳之前不需要手工先构建组件**。

## 版本面值的权威位置

- 组件：[`z-task-component/package.json`](z-task-component/package.json) — `version` 即发布到 npm 的版本
- 壳：[`z-task-suit/package.json`](z-task-suit/package.json) — `private: true`，不发布

## 与后端的接线

- 组件的 request 层由 `@yuku123/z-frontend-common` 工厂创建，baseURL 固定 `/api`
  （[`services/request.js`](z-task-component/src/services/request.js)）；
  需要改后端前缀时用组件导出的 `configureTask({ apiBase })`（从
  `@yuku123/z-task-component/pages` 导出）覆写。
- 壳的 dev server 已配 `/api` → `http://localhost:8888` 反代；本仓后端在
  [`../z-task-admin/`](../z-task-admin/)。
- ⚠️ 壳目前是 **mock 登录**（账号由构建期 VITE_MOCK_USER / VITE_MOCK_PASSWORD 注入，见 `App.jsx` 里 lead 008 §16 那条），
  CTC / SSO 接入后换共享 `LoginPage` 的 `loginApi`。

> 维护约定：组件与壳的任何改动都**不要**写进仓根 README 的功能陈述，
> 仓根 README 只指回本文件（lead 002 规范：README 的「文档目录」段必须链到真实文件）。
