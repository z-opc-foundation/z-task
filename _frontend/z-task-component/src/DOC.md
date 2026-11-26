# z-task-component

z-task（任务管理）跨仓唯一前端面：把「任务管理 / 项目管理 / 用户管理 / 仪表盘」这一整套任务页面
收敛成一个可复用的 React 组件包。

- **npm 包名**：`@yuku123/z-task-component`
- **宿主接入**：`@yuku123/z-task-component/pages`（manifest + 页面），主壳可只取 `ComponentDocPage`
- **后端**：z-task 的 `/api/task/**`、`/api/project/**`、`/api/auth/login`
- **技术栈**：React 19 + antd 6 + react-router-dom 7 + vite（library mode，双入口 `.` / `./pages`）

---

## 一、能力概览

路由前缀 `/z-task`，菜单在 `src/appMeta.jsx`，路由在 `src/pages-manifest.jsx`（**两者分开**）。

| 页面 | 路由（相对 `/z-task/*`） | 源文件 | 能力 |
|------|--------------------------|--------|------|
| 登录 | `login` | `pages/Login.jsx` / `pages/LoginPage.jsx` | 登录（`POST /api/auth/login`） |
| 首页 | `home` | `pages/HomePage.jsx` | 入口卡片页 |
| 仪表盘 | `dashboard` | `pages/Dashboard.jsx` | 总任务数 / 待办 / 进行中 / 已完成四张统计卡 |
| 任务管理 | `task` | `pages/task/TaskList.jsx` | 任务列表 + 完成任务 / 重新打开（基座 `ListTable`） |
| 任务编辑 | `task/edit/:id?` | `pages/task/TaskEdit.jsx` | 任务新建 / 编辑表单 |
| 项目管理 | `project` | `pages/project/ProjectList.jsx` | 项目列表 + 新建 / 归档（基座 `ListTable`） |
| 用户管理 | `user` | `pages/user/UserList.jsx` | 用户列表（基座 `ListTable`） |
| 组件文档 | `docs` | `pages/ComponentDoc.jsx` | 本文件渲染页（左侧 240px TOC + 右侧正文） |

`src/pages/TaskApp.jsx` 是 `/z-task/*` 的子路由容器（`dashboard` / `task` / `task/edit/:id?` /
`project` / `user`，index 重定向到 `task`），被 `routes` 里的 `/z-task/:rest*` 承接。

### 1.1 可复用子组件（`src/components/`）

| 组件 | 说明 |
|------|------|
| `TaskCard` | 任务卡片 |
| `TaskTable` | 任务表格 |
| `ProjectSelect` | 项目选择器 |
| `ProjectList` | 项目列表组件版 |
| `TaskList` | 任务列表组件版 |
| `TaskDashboard` | 任务仪表盘组件版 |
| `TaskApp` | 域内路由容器组件版 |
| `TaskDetailDrawer` | 任务详情抽屉 |
| `TaskEditModal` | 任务编辑弹窗 |

这组组件从包根 `src/index.js` 导出（宿主可直接用，不必走 manifest）。

## 二、导出面

```js
// 主入口（. 桶）：可复用组件 + taskApi
import {TaskCard, TaskTable, ProjectSelect, TaskApp, taskApi, ComponentDocPage} from '@yuku123/z-task-component'

// 宿主组装面（./pages 桶）：manifest + 页面
import {menuItems, routes, HomePage, LoginPage, TaskList, TaskEdit, ProjectList, UserList} from '@yuku123/z-task-component/pages'
```

`./pages` 桶 = 一组具名再导出 + `export * from './pages-manifest.jsx'` 的整份转发。
**不要再手挑名字** —— 之前手挑过一次，manifest 新增的 `HomePage` / `LoginPage` 没被转发，
rollup 直接报 `LoginPage is not exported by dist/pages.js`。

## 三、API 端点

包内有**两套 API 客户端**，路径写法不同，详见「已知限制」。

### 3.1 `src/api.js`（`taskApi`，包根导出，components/ 下的组件用这套）

请求实例 `createRequest('task')`，`baseURL` 落到默认的 `/api`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/project/user/list` | 我的项目列表 |
| POST | `/project` | 创建项目 |
| PUT | `/project/{id}` | 更新项目 |
| PUT | `/project/{id}/archive` | 归档项目 |
| GET | `/task/project/list?projectId=` | 项目下的任务 |
| GET | `/task/list?listId=` | 列表下的任务 |
| POST | `/task` | 创建任务 |
| POST | `/task/complete?taskId=` | 完成任务 |
| PUT | `/task/move?taskId=&targetListId=&position=` | 移动任务 |
| GET | `/task/{id}` | 任务详情 |
| PUT | `/task/{id}` | 更新任务 |
| DELETE | `/task/{id}` | 删除任务 |

### 3.2 `src/services/api.js`（页面用这套）

请求实例 `src/services/request.js`，`baseURL='/api'`，并注入 `X-User-Id` 头。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录（后端是 `/api/auth/login`，**不是** `/api/user/login`） |
| GET | `/api/task/list?listId=` | 按列表取任务 |
| GET | `/api/task/project/list?projectId=` | 按项目取任务 |
| GET | `/api/task/assignee/list?userId=` | 按负责人取任务 |
| POST | `/api/task` | 创建任务 |
| PUT | `/api/task/move?taskId=&targetListId=&position=` | 移动任务 |
| POST | `/api/task/assignees/add?taskId=&userId=` | 加负责人（后端是 POST，不是 DELETE） |
| POST | `/api/task/assignees/remove?taskId=&userId=` | 移除负责人（后端是 POST） |
| POST | `/api/task/complete?taskId=` | 完成任务（后端是 `POST /api/task/complete`，不是 `/api/task/{id}/complete`） |
| POST | `/api/task/reopen?taskId=` | 重新打开任务 |
| GET | `/api/project/user/list?userId=` | 我的项目列表 |
| POST | `/api/project` | 创建项目 |
| PUT | `/api/project/{projectId}/archive` | 归档项目 |

## 四、页面说明

### 4.1 仪表盘

按当前负责人取任务（`getTaskListByAssignee`），渲染总任务数 / 待办 / 进行中 / 已完成四张统计卡。

### 4.2 任务管理

任务列表（`getTaskListByList`），行内可**完成任务**（`completeTask`）与**重新打开**（`reopenTask`）。
过滤交给基座 `ListTable` 内置的搜索框 —— 原来页面上那个 antd `Search` 没接 `onChange`，是死的，已去掉。

### 4.3 任务编辑

任务新建 / 编辑表单（路由 `task/edit/:id?`，`:id` 可选 ⇒ 同一条路由兼做新建）。

### 4.4 项目管理

项目列表 + 新建项目 + 归档项目，统一用基座 `ListTable`。

### 4.5 用户管理

用户列表，用基座 `ListTable`。

### 4.6 组件文档

本文件。内容以 `?raw` 在编译期内联，零额外请求；左侧 240px TOC 随滚动联动。

## 五、配置

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `configureTask({apiBase})` | `'/api'` | 改写 `src/services/request.js` 实例的 `baseURL` |
| `X-User-Id` 头 | localStorage `userId` | `services/request.js` 的拦截器自动附加（`ProjectController.create` 等接口要） |
| 登录态判据 | localStorage `token` | `isAuthenticated()` 与 suit 的 `ProtectedShell` 都用它 |
| token 注入 | `Authorization: Bearer` | 基座拦截器统一处理 |

## 六、已知限制

- **菜单在 `src/appMeta.jsx`，不在 `pages-manifest.jsx`**。这是为了断开循环依赖：
  `HomePage` 要 import `menuItems`，而 manifest 又 import `HomePage` ⇒ 循环会让 `menuItems`
  落进 TDZ，浏览器报 `Cannot access 'X' before initialization`，整页白屏且控制台无日志。
  页面组件直接在 manifest 里 import，不要绕道 `pages.js` 再转发。
- ⚠ **菜单项 `/z-task/overview` 没有对应路由**（路由是 `/z-task/dashboard`）——
  点「仪表盘」会落到 `/z-task/:rest*` → `TaskApp` → 没有 `overview` 子路由 ⇒ 空白页。
- **包内有两套 API 客户端，路径口径不同**：
  `src/api.js`（`taskApi`）写的是**不带** `/api` 前缀的路径，配 `baseURL='/api'` ⇒ 实际 `/api/xxx`；
  `src/services/api.js` 写的是**带** `/api` 前缀的路径，也配 `baseURL='/api'` ⇒ 实际拼成 `/api/api/xxx`。
  改后端契约时要认准自己动的是哪一套。
- `src/api.js` 里写的是 `createRequest('task')`（传了字符串而不是配置对象）——
  `createRequest` 取 `options.baseURL` 时拿到 `undefined`，于是回落到默认 `/api`。
  结果碰巧是对的，但这是笔误，复制这个写法会踩坑。
- `routes` 里 dashboard / task / project / user 四条的 `Component` 是 `null`，
  实际由 `TaskApp` 接管 —— **suit 侧渲染 null 路由时必须跳过**，否则会炸。
- 登录页有两份（`pages/Login.jsx` 与 `pages/LoginPage.jsx`），manifest 导出的是 `Login`（前者）
  与 `LoginPage`（后者），宿主按需取。
- 组件包必须 external 基座；`vite.config.js` 的 `external` 是精确字符串匹配，
  `@yuku123/z-frontend-common/ui` 与 `/ui/echarts` 两个子路径必须逐个列出，漏了基座会被复制进 dist。

## 七、变更记录

| 版本 | 变更 |
|---|---|
| 0.1.1 | 新增组件文档页 `ComponentDocPage`（lead 008 §7）：`src/DOC.md` + 基座 `ComponentDoc` 薄包装 |
| 0.1.1 | `appMeta` / `menuItems` 从 `pages-manifest.jsx` 拆到 `appMeta.jsx`，断掉模块循环 |
| 0.1.0 | 首版：任务 / 项目 / 用户页面集 + manifest + 两套 API 客户端 |
