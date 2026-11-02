# 待办（Todo）能力从 z-team 迁入 z-task —— 方案与实施记录

> 需求原话：「z-task 实际上承担一下 我们的 todo 的能力，现在 todo 是在 z-team 的，你给他弄过来」
>
> 本文件是这次迁移的**决策真源**。所有取舍都写在这里，代码落地时按此执行。

## 1. 背景与硬约束

### 1.1 待办能力当前分布

| 位置 | 内容 | 行数 |
|---|---|---|
| `z-team/z-team-core/.../persistence/entity/TodoProject.java` | 项目实体（表 `z_team_todo_project`） | 152 |
| `z-team/z-team-core/.../persistence/entity/TodoItem.java` | 事项实体（表 `z_team_todo_item`） | 283 |
| `z-team/z-team-core/.../persistence/mapper/TeamTodo{Project,Item}Mapper.java` | Mapper | 12+12 |
| `z-team/z-team-core/.../service/todo/TodoProjectService.java` | 项目 CRUD + 成员 + 可见性 | 367 |
| `z-team/z-team-core/.../service/todo/TodoItemService.java` | 事项 CRUD + 视图 + 排序 + 父子 | 504 |
| `z-team/z-team-core/.../service/todo/TeamTodoSpaceService.java` | 项目空间文件服务（纯 NIO） | 363 |
| `z-team/z-team-core/.../service/todo/TodoAgentDispatchService.java` | 待办 → Agent 会话派发 | 260 |
| `z-team/z-team-core/.../tools/TeamTodoSpaceTool.java` | LLM 工具 `z_team_todo_space` | 305 |
| `z-team/z-team-web/.../controller/personal/TodoController.java` | REST 入口 `/api/todo/**` | 412 |
| `z-team/z-team-starter/.../config/TeamTodoSchemaPatcher.java` | 幂等建表 | 130 |
| `z-team/_frontend/z-team-component/.../TodoTab/*` | 前端 12 个文件（TSX + CSS Modules） | ~2.4k |

### 1.2 版本线分裂（本方案的第一约束）

调研实测结论（2026-11-02）：

| 仓 | 技术栈 | 证据 |
|---|---|---|
| **z-opc（主壳）** | Spring Boot 2.7.18 / Java 8 | `z-opc/pom.xml` parent `z-boot-parent:1.0.21`，pluginManagement 下发 `spring-boot.version=2.7.18`、`maven.compiler.source/target=8` |
| **z-team** | Spring Boot 2.7.18 / Java 8 | parent `z-boot-parent:1.1.0`，同口径 |
| **z-task（仓内）** | Spring Boot 3 / Java 17 | 提交 `22e7770 chore(java17): 迁移至 JDK 17 + Spring Boot 3 火车`；实测 `mvn compile` 输出 `javac [debug target 17]` |
| **z-task（中央已发布 1.0.0）** | Spring Boot 2 / Java 8 | `~/.m2/.../z-task-web-1.0.0.jar` 内 `TaskMyBatisConfig.class` 实测 **major version 52**（= Java 8），签名用 `javax.sql.DataSource`；jar 内是 `META-INF/spring.factories`（SB2 形态） |

⇒ **z-task 仓内代码已是 SB3/Java 17 字节码，而主壳与 z-team 是 SB2/Java 8。**

**结论：todo 的 Java 代码不可能以「共享 jar」的方式同时进 z-task 与 z-team。**
只要 z-task 发布 SB3 字节码，主壳（Java 8）连编译都过不去。

⇒ **唯一可行路径：todo 归 z-task 独占实现，z-team 通过 HTTP 调用。**
这同时满足 lead 003 原则 21「跨板块只走 HTTP、零 jar 边界」的既有铁律 —— 不需要新开例外。

### 1.3 部署形态

`z-task` 已是**独立工作负载**：

- `z-task/deploy/k8s/02-deployment.yaml`：Deployment `z-task-admin`，namespace `z-task`，容器端口 **8082**
- `z-task/deploy/k8s/01-service.yaml`：Service `z-task-admin`，NodePort 8082 → nodePort **31882**
- `z-task/z-task-admin/src/main/resources/application.yml`：`server.port: 8082`，数据源 `z.base.db.task.*`（缺省回退 `z.base.db.default.*`）

⇒ todo 落到 z-task 后，天然获得独立部署、独立扩容、独立故障域。

### 1.4 用户 ID 语义（两侧一致，无映射表）

| 侧 | 取值 |
|---|---|
| z-team | `TeamCurrentUserResolver.requireUser(token).getRefId()` ← `TeamLoginUser.fromUserInfo(ssoUser)`，即 z-ctc SSO `userId` |
| z-task | `request.getAttribute("ssoUser")` → `UserInfo.getUserId()`（`ProjectController`）/ `getUsername()`（`TaskController`，⚠ 不一致，见 §6.1） |

⇒ 两边都是 **z-ctc SSO userId 字符串**，成员/指派/可见性语义可直接平移，**不需要 ID 映射表**。

---

## 2. 决策

### 决策 1：数据模型 —— 新建 `z_task_todo_*` 表，与 `z_task_task` 并存

**选：不并入 `z_task_project` / `z_task_task`。**

理由：

1. **语义不等价，强行并表会丢能力。** `z_task_task` 是「看板任务」：状态是 `0待办/1进行中/2已完成` 数字、`board_id` + `list_id` 两级归置、`creator_id` 单人创建、无成员共享概念、无父子事项、无 tags/links JSON。
   而 todo 是「个人待办」：状态是 `TODO/DOING/DONE/ARCHIVED` **字符串且支持项目自定义状态**（`C_` 前缀）、`parent_id` 父子树、`tags`/`links` JSON、`assignee_user_id` 指派、项目成员共享（private/shared 可见性）、`extra_info` 看板列配置 JSON。
   把 todo 塞进 `z_task_task` 需要给 `z_task_task` 加 6 个以上字段，且 `list_id`/`board_id` 对收集箱事项（`project_id=NULL`）无意义 —— **会污染 z-task 现有的任务域**。
2. **z-task 现有 `z_task_task` 有活跃消费方**：`z-opc/z-opcs-bridge`（撮合市场桥接，`ZTaskBridgeHook` 落库到 `z_task_task`）。改它的语义会波及撮合链路。
3. **迁移必须保留存量数据**。todo 表有真实存量（`z_team_todo_project` / `z_team_todo_item` 已有数据，且 `agent_id` / `agent_session_id` 列由 `z-team/_sql/z-team-todo-agent-space.sql` 追加过）。
   并表 ⇒ 需要把 todo 行翻译成 task 行再翻译回来，且 `parent_id` 树、`extra_info` 列配置、字符串状态全都要映射 —— **转换有损**，而新建表可以逐字搬迁。
4. **id 值域必须保留**。`z_team_todo_item.id` 被前端 `parentId` 引用、被 `agent_session_id` 关联、被 Agent 会话上下文引用。新建表保留原 id 值域 ⇒ 软外键全部继续有效。

⇒ **落地表名：`z_task_todo_project` / `z_task_todo_item`，逐字保留 z-team 的列语义与 id 值域。**

### 决策 2：API 前缀 —— z-task 侧 `/api/todo/**`，z-team 侧保留 `/api/todo/**` 作为代理

- z-task 新增 `/api/todo/**`（原生实现），这是**待办能力的权威入口**。
- z-team 保留 `/api/todo/**` 路径，但实现改为**转发到 z-task**（HTTP 代理）⇒ **前端零改动**，存量客户端零改动。

### 决策 3：z-team 侧保留 Agent 派发编排，其余改为 HTTP 委托

**必须留在 z-team（不能搬）：**

| 类 | 原因 |
|---|---|
| `TodoAgentDispatchService` | 依赖 `TeamPersonalChatService`（个人 Agent 会话编排，z-team 独有基础设施），调用 `createSession(userId, agentId, title, projectId, projectTitle)` |
| `TeamTodoSpaceTool` | 依赖 `BaseTool`（LLM 工具体系），工具名 `z_team_todo_space` 已被 Agent 侧硬编码引用 |
| `TeamPersonalWorkTool` | 依赖 `BaseTool`，工具名 `z_team_personal_work` 与 action `complete_todo` 被 kickoff 文本硬编码 |
| `TeamPersonalAgentRuntimeRegistry` | 个人 Agent 工具装配中枢 |
| `TeamPersonalDigestScheduler` | 依赖个人会话 |

**可以搬到 z-task：** 实体、Mapper、`TodoProjectService`、`TodoItemService`、`TeamTodoSpaceService`（纯 JDK NIO）、`TeamTodoSchemaPatcher`、`TodoController`。

### 决策 4：项目空间物理文件保持同一目录，不搬文件

`{z-team.workspace.base-dir}/todo/{projectId}/`

z-task 侧新增同名配置项（`z-task.workspace.base-dir`），**生产必须指向与 z-team 完全相同的物理目录**。
目录名由 `projectId` 确定性推导（不落库）⇒ 只要 base-dir 一致，**存量文件零迁移、零丢失**。

> ⚠ 这是本方案唯一的运维硬约束：z-task 与 z-team 必须挂载**同一个** workspace 卷（k8s PVC / 同一宿主机路径），否则项目空间会分叉成两份。
> 落地时在 z-task 的 Deployment 里加挂载，并在 `_doc` 写明。

**实施后的收敛（2026-11-02）：** 待办的**实际读写已全部在 z-task 侧**
（`TodoSpaceService` 是唯一实现），z-team 侧的 `TeamTodoSpaceService` 退化为 Facade，
只做路径推导与转发，**不再碰 `todo/` 目录**。

⇒ base-dir 一致性由 **z-task 单侧保证**，z-team 无需同步改配置。
⇒ 但**存量文件仍在 z-team 原来那份目录里**，z-task 的 base-dir 必须指到那一份（不能另起新目录）。

### 决策 5：前端 —— todo 前端整体搬入 z-task-component，z-team 侧保留笔记/聊天耦合部分

- `TodoTab/` 12 个文件（TSX + CSS Modules + zustand）搬入 `z-task/_frontend/z-task-component`。
- ⚠ z-task-component 现状是 **全 JS/JSX、无 TypeScript、无 CSS Modules、无 zustand**。搬运需要：
  - 补 TS 依赖与 `vite` 的 TS 支持
  - CSS Modules 需确认 vite 配置已开（`.module.css` 默认支持）
  - zustand 需加依赖
- `PersonalNoteTab/index.tsx` 与 todo 的**双向耦合**（`todoLinkUtils`）需要拆开：
  - `todoLinkUtils` 里**纯 todo 域**的函数（`buildTodoProjectContext` / `findTodosLinkedToNote` / `linkedTodoChipLabel`）→ 随 todo 搬走
  - `PersonalNoteTab` 留在 z-team，但它需要查 todo ⇒ 通过 z-task 的 HTTP API 查，**不再 import todo 的 TS 模块**

**分阶段**：先做后端（能力归属），前端作为第二阶段。本阶段不动前端 ⇒ 前端继续打 z-team 的 `/api/todo/**`，而 z-team 已改为代理到 z-task ⇒ **前端零改动即完成切换**。

### 决策 6：z-team 侧用 Facade 模式 —— 保留类名与全部 public 方法签名，只换实现体

**这是实施阶段推翻原计划的关键决策。**

原计划（第 5 步）写的是「`TodoProjectService` / `TodoItemService` / `TeamTodoSpaceService`
的**实现体**改为调用 client」——但实施时实测发现：

| 项 | 原计划假设 | 实测（2026-11-02） |
|---|---|---|
| 旧 todo 实现的生产消费方 | 2 个类 | **8 个生产类** |
| 旧 todo 实现的测试消费方 | 2 个测试类 | **20+ 个测试类** |

若按原计划「删旧实现、改写方法签名」，爆炸半径会波及 8 个生产类 + 20+ 个测试类，
跨仓迁移的风险与工期都要重估。

⇒ **改为 Facade**：`TodoItemService` / `TodoProjectService` / `TeamTodoSpaceService`
三个类的**类名不变、全部 public 方法签名不变**，只把实现体从
「直连 Mapper / 本地文件系统」换成「委派 `TeamTodoClient`」。

收益：

- 8 个生产消费方 + 20+ 个测试类**零改动**
- 迁移窗口内若需回滚，只要把实现体换回去（甚至可以保留双实现按开关切换）
- 前端 / LLM 工具 / Controller 契约完全不受影响

代价（已接受）：

- `TeamTodoSpaceService` 需**新增带 `userId` 的重载** —— 因为 z-task 侧的项目空间权限校验
  依赖 userId（`requireVisible`），而旧签名不带 userId。保留旧签名（委托到新签名时传空 userId）
  以兼容既有调用方，但**空间相关的新调用必须用带 userId 的重载**。
- z-team 侧的 `TodoProject` / `TodoItem` 实体类仍保留（作为 DTO / 传输载体），但不再有 Mapper 落库。

---

## 3. 落地步骤

### 第 1 步：z-task 侧建 todo 领域层（无副作用）

- `z-task-core/.../domain/entity/TodoProject.java`、`TodoItem.java`（表 `z_task_todo_*`）
- `z-task-core/.../domain/mapper/TodoProjectMapper.java`、`TodoItemMapper.java`
  ⚠ 必须在 `com.zifang.z.task.core.domain.mapper` 包下，否则 `TaskMyBatisConfig` 的 `@MapperScan` 扫不到 ⇒ **静默查不到表**
- `z-task-core/.../domain/entity/base/TodoAuditDO.java`（对应 z-team 的 `TeamDetailAuditDO`，审计字段 + `create_by_name`/`update_by_name`）
- `z-task-core/.../service/TodoProjectService.java`、`TodoItemService.java`（含 `TodoProjectBundle` DTO）

### 第 2 步：z-task 侧建 REST API + 项目空间

- `z-task-web/.../api/TodoController.java`：`/api/todo/**`
- `z-task-core/.../service/TodoSpaceService.java`：项目空间文件服务（保留 z-team 的安全边界常量：读 1MB / 写 2MB / 树 1000 条 / 拒绝绝对路径与 `..`）
- ⚠ `ZTaskWebAutoConfiguration` 的 `@ComponentScan` 白名单要扩到新的 service 包
- ⚠ `TaskMyBatisConfig` 的 `@MapperScan` 要覆盖新 mapper 包

### 第 3 步：z-task 侧建表（幂等）

- `z-task-admin/.../host/TaskTodoSchemaPatcher.java`（或并入 `E2ESqlMigrationRunner`）
- 权威 DDL 同步进 `z-task/_doc/002_deploy/init/schema.sql`

### 第 4 步：存量数据迁移脚本

- `z-task/_doc/002_deploy/init/migration_todo_from_z_team.sql`
- `z_team_todo_project` → `z_task_todo_project`（保留 id、members JSON、extra_info JSON）
- `z_team_todo_item` → `z_task_todo_item`（保留 id、project_id、parent_id、tags/links JSON、agent_id/agent_session_id）
- 幂等：`INSERT ... SELECT ... WHERE NOT EXISTS` 或先 `TRUNCATE` 目标表再灌

### 第 5 步：z-team 侧改为 HTTP 委托 ✅ 已完成（2026-11-02）

原计划写的是 `RemoteTodoClient`，实施时改名为 **`TeamTodoClient`**（放在
`z-team-core/.../integration/todo/`，与 `RemoteEvolutionClient` 同范式：HttpURLConnection + z-util `JsonUtil`，零 Spring 依赖）。

**实施要点：**

| 项 | 处置 |
|---|---|
| `TeamTodoClient` | 重写。⚠ 修正了一个**致命误判**：原代码判 `code != "0"` 即失败，但实测 `BaseStatusCode.OK.getCode() == 200` ⇒ 成功响应会被当成失败。现改为 `CODE_SUCCESS = 200` 判等。 |
| 客户端返回类型 | 统一返回 `Map<String, Object>` / `List<Map>`，并在客户端内做**类型化转换**（`toProject` / `toItem` / `dateOf` / `dateTimeOf`），显式逐字段映射，避免静默丢字段。 |
| `TodoItemService` / `TodoProjectService` / `TeamTodoSpaceService` | 全部改为 Facade（类名 + public 方法签名不变）。移除 Mapper 依赖，改为注入 `TeamTodoClient`。 |
| `TeamTodoSpaceService` | 新增带 `userId` 的重载（tree / read / write / mkdir / delete / search）；保留旧签名以兼容既有调用方。`resolveRoot` / `resolveSafe` / `relativize` 保留为**本地路径推导**（不再做 IO），客户端侧仍做越界预判，z-task 侧再复核一次。安全边界常量（读 1MB / 写 2MB / 树 1000 条）逐字保留。 |
| `TodoAgentDispatchService` | **留在 z-team**（派发要开 z-team 独有的个人 Agent 会话）。`buildKickoff` 新增带 userId 的 4 参重载并保留 3 参兼容重载；kickoff 文本里的 `z_team_todo_space` / `z_team_personal_work` / `complete_todo` **逐字未改**。读空间失败**降级为空列表**（不阻断派发）。 |
| `TeamTodoSpaceTool` | 6 处空间调用全部补上 `userId`（否则 z-task 侧权限校验失败）。工具名与 ACTIONS 描述、schema 均未改。 |
| `z-team/z-team-web/.../TodoController` | 完全重写为**同路径代理**：所有 `/api/todo/**` 转发到 `TeamTodoClient` ⇒ 前端零改动。`dispatch` / `undispatch` 继续委托 `TodoAgentDispatchService`。 |
| 旧写路径 | **删除** `TeamTodoProjectMapper` / `TeamTodoItemMapper` / `TeamTodoSchemaPatcher` ⇒ 旧表 `z_team_todo_*` 的写路径彻底消除（`ZTeamWebAutoConfiguration` 的 exclude filter 同步清理）。 |
| 配置 | z-team 新增 `z-team.todo.base-url`，默认 `http://z-task-admin.z-task.svc.cluster.local:8082`。 |

**z-task 侧补齐的端点**（原 HTTP 面只暴露 tree/read/write，撑不起 `z_team_todo_space` 的 6 个 action）：

- `GET /api/todo/projects/{id}` —— 取单个项目（`requireVisible` 需要）
- `POST /api/todo/projects/{id}/space/dir` —— mkdir
- `DELETE /api/todo/projects/{id}/space/file` —— delete
- `GET /api/todo/projects/{id}/space/search` —— search

**测试职责重新划分：**

| 位置 | 职责 |
|---|---|
| `z-task/.../TodoSpaceServiceTest`（**新建**，14 用例） | **真实文件系统沙箱断言**：根目录自动创建、写入读回、append 累加、拒绝 `..`、拒绝绝对路径、拒绝删根目录、目录树排序、depth 截断、检索命中、二进制拒绝、超限拒绝、UTF-8 往返、mkdir、delete |
| `z-team/.../TeamTodoSpaceServiceTest`（重写） | 改为验证「客户端侧越界预判 + 转发契约（userId 必须带上）」，mock `TeamTodoClient` 驱动 |
| `z-team/.../TodoAgentDispatchServiceTest`（重写） | 空间清单改 mock `TeamTodoClient.spaceTree(...)`；派发契约 7 个用例不变 |
| `z-team/.../TeamTodoSpaceToolTest`（重写） | 空间操作改 mock；工具契约 9 个用例不变 |

**实测结论（2026-11-02）：**

- z-task 全量单测 **72 用例全绿**（core 65 + admin 7）
- z-team `z-team-core` 的 todo 相关单测 **全绿**；`z-team-core` 全量仅 `SandboxSmokeTest` 2 例失败，
  经 `git stash` 对照确认**基线即失败**，与本次改动无关
- z-team `z-team-agent-core` 的 8 例 shell 沙箱 repeat-guard 失败，同为**基线既有失败**（stash 对照验证）

### 第 6 步（第二阶段）：前端搬迁 ✅ 已完成（2026-11-02）

搬运形态：**能力搬到 z-task，z-team 只复用**（用户定的总原则）。
所以前端不是"复制一份"，而是：

| 项 | 归属 | 说明 |
|---|---|---|
| `TodoTab` 及 11 个兄弟组件 | **z-task-component** | 唯一真源，z-team 从 `@yuku123/z-task-component` 引入 |
| 待办域 API（`todo` / `crossdomain`） | **z-task-component** | `services/todo-api/`，统一出口 `index.js` |
| Markdown 渲染/编辑 | **z-markdown-component**（新包） | vditor + react-markdown + mermaid，两仓 + 主壳共用 |
| `todoLinkUtils`（待办↔笔记关联纯函数） | **z-task-component** | 读的是待办数据结构 ⇒ 跟着待办走；z-team 的 `PersonalNoteTab` 反过来引它 |
| 宿主编排（打开笔记 / 打开群聊项目 / 派发会话） | **z-team** | 通过 props 回调注入，不写进组件 |

#### 6.1 前端请求为什么统一打 `/z-team/api`

待办**数据**在 z-task，但待办详情里的 5 类能力**归属仍是 z-team**
（个人笔记 / 个人 Agent / 员工搜索 / 群聊场景 / 图片上传），
且「派发」的**编排**（开个人 Agent 会话）也留在 z-team。

⇒ 前端一条基址 `/z-team/api` 打 z-team 的 Facade，读写 + 派发 + 跨域能力全齐；
主壳 nginx 已有 `/z-team/api/` 规则 ⇒ **nginx 零改动、前端零跨域**。
宿主可用 `configureApiBase()` 按环境覆盖（生产 Kong 前缀 `/kapi/z-team/api`）。

⚠ **端点是 `dispatch` / `undispatch`（z-team 口径）**，不是 z-task 的 `dispatch-agent`。
后者只回写 `agentId`/`agentSessionId` 绑定、**不真正开会话** ⇒ 直连会得到
「派发成功但没有会话」。

#### 6.2 三条踩过的坑（都已修，别回退）

1. **CSS 不会自动跟着 JS 走**。vite lib 模式把 `*.module.css` 抽成独立文件，
   JS 入口里不留 `import` ⇒ 宿主只引 JS 时"结构在、样式全丢"（卡片没边框、选项卡是裸链接）。
   ⇒ 两个包都暴露 `exports["./style.css"]`，**宿主必须显式引入**（顺序：markdown 在前）。
2. **vditor 在 StrictMode 下会静默空白**。vditor 初始化是异步的，而 StrictMode 会
   挂载→清理→再挂载；第一次的 `destroy()` 迟到，把第二次刚建好的 DOM 一起清空。
   ⇒ 每次挂载用**专属子容器**，destroy 只可能清掉自己那份。
3. **HTTP 200 但不是 JSON ⇒ 必须抛错**。后端/网关对未匹配的 `/api/**` 会兜底返回
   `index.html`（状态 200）；原 `unwrapResult` 把 HTML 当数据返回，
   调用方 `.map()` 直接炸在离根因很远的地方。
   ⇒ 现在统一报「接口返回的不是 JSON（URL）」并给出成因。

#### 6.3 vditor 静态资源

vditor 运行时按**路径字符串**去 fetch `/vditor/dist/js/{i18n,lute,icons,mermaid}/...`
（不是 npm import 能解决的）。仓库不提交这 ~8MB 派生物，
由 `z-task-suit/scripts/sync-vditor-assets.mjs` 在 `predev` / `build` 前从
`node_modules/vditor/dist` 同步到 `public/vditor/dist`。

⚠ **主壳目前缺 `js/mermaid`**（`z-opc-main-starter-frontend/public/vditor/dist/js/`
下只有 `i18n`/`icons`/`lute`）⇒ 主壳里 Mermaid 图表会 404。

#### 6.4 页面点验（2026-11-02 实测）

本地起 z-task（8082，`--sso.enabled=false`）+ suit dev（3009，`ZTASK_DIRECT=1`），
真实 Chrome 走完：列表按项目分组渲染 → 切「全部事项」→ 打开事项详情 →
字段/Agent 区块/子事项/链接/markdown 编辑器（vditor 工具栏 + 占位文案）全部正常，
**无页面级异常、无失败请求**。

⚠ 本地启动必须补一条 Druid 排除项：`application.yml` 里排除的是
SB2 的 `com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceAutoConfigure`，
而项目在 SB3 线上（`druid-spring-boot-3-starter`），真实类在
`com.alibaba.druid.spring.boot3.autoconfigure` ⇒ 排除静默失效，
启动直接报「Failed to determine suitable jdbc url」。**两个包名都要列**。

---

## 4. 风险清单

| 风险 | 等级 | 处置 |
|---|---|---|
| z-task 发布 SB3 字节码，主壳（Java 8）无法消费 | **高** | 主壳已通过 `z-opcs-bridge` 依赖 `z-task-core`/`z-task-web` ⇒ **主壳必须先做 SB3 迁移**，否则 z-task 抬版本即编译失败。**这条不在本次 todo 迁移范围内，但它是 z-task 后续任何发版的前置条件。** |
| **z-task 的 Deployment 无任何 volume 挂载** | **高** | **2026-11-02 已修**：待办迁入前 z-task 不落文件所以没挂卷，迁入后暴露 ⇒ Pod 重启/迁移/滚动更新后项目空间文件全丢，而数据库记录还在（用户看到「事项在、文件没了」）。已在 `deploy/k8s/02-deployment.yaml` 补 `hostPath: /data/z_team`（`DirectoryOrCreate`）+ `volumeMounts` + `ZTASK_WORKSPACE_BASE_DIR=/data/z_team`。⚠ 当前集群是 k3s 单节点，hostPath 有效；**扩多节点须改用 PVC（ReadWriteMany）**。 |
| 项目空间目录分叉（两仓 base-dir 不一致） | **高** | **2026-11-02 已收敛**：读写只在 z-task 侧，base-dir 由 z-task 单侧保证。但 z-task 的 base-dir 必须指到**存量文件所在的那份目录**（不能另起新目录），上线前须核对。 |
| 双写期数据不一致 | 中 | z-team 侧旧写路径已**删除**（Mapper + SchemaPatcher 均已删）⇒ 结构上不可能双写。存量搬迁靠 `migration_todo_from_z_team.sql` 一次性执行。 |
| `MapperNameConflictGuard` 报 mapper 简单名冲突 | 中 | ✅ 已消解：z-team 侧 `TeamTodoProjectMapper` / `TeamTodoItemMapper` 已删除，不存在同名 mapper 被同时扫到。 |
| z-task `@ComponentScan` 白名单漏了新 service 包 | 中 | ✅ 已核对：`ZTaskWebAutoConfiguration` 已扩到新 service 包。遗漏表现为 **bean 找不到**（启动即失败，不会静默）。 |
| z-task `@MapperScan` 漏了新 mapper 包 | 中 | ✅ 已核对：`TaskMyBatisConfig` 已覆盖新 mapper 包。遗漏表现为 **查不到表**（静默）。 |
| 前端 TS/JS、zustand、CSS Modules 差异 | 中 | 第二阶段处理，本阶段前端零改动 |
| `TaskController` 用 `getUsername()` 而 `ProjectController` 用 `getUserId()` | 低 | **z-task 新增 todo 端点统一用 `getUserId()`**（与 z-team 的 refId 语义一致）；顺手修 `TaskController` 的历史不一致 |
| `Result` 信封成功码被误判为 0 | **高** | ✅ 已修（实施期实测发现）：`BaseStatusCode.OK.getCode() == 200`。`TeamTodoClient` 现判 `code == 200`，错误码语义：`401` 未登录 / `600` 参数校验 / `500` 未知错误。 |
| `z-task` 仓内 z-util 版本线（1.0.22）与 z-team（1.2.4）API 差异 | 中 | ✅ 已实测规避：`JsonUtil.parse` / `toPlainValue` 在 1.0.22 不存在（`JsonUtil` 实际在 `z-util-parser-json` artifact 里），客户端只用两版都有的 `parseToMap` / `fromJson` / `toJson`。序列化行为实测一致（`LocalDate` → `"2026-11-02"`、`LocalDateTime` → `"2026-11-02T10:30:15"`、`Long` 保持数值型、null 字段保留）。 |

---

## 5. 不做的事（明确边界）

- ❌ 不改 z-task 现有 `z_task_task` / `z_task_project` 语义（避免波及 z-opcs-bridge）
- ❌ 不动 `z_team_todo_space` 运维表（z-team 留痕用，业务不依赖）
- ❌ 不改 LLM 工具名 `z_team_todo_space` / `z_team_personal_work` 与 action `complete_todo`（契约稳定，Agent 侧硬编码引用）
- ❌ 不在本阶段做前端搬迁（后端能力归属优先，前端走代理零改动）
- ❌ 不做主壳 SB3 迁移（独立任务，但需记录为 z-task 后续发版前置条件）

---

## 7. 上线检查清单（发版前逐条核对）

### 7.1 代码侧（本次已完成）

- [x] z-task 侧 todo 领域层 + REST + 空间服务 + 建表脚本齐备
- [x] z-task 侧补齐 `GET /projects/{id}` + 空间 `dir` / `delete` / `search` 三个端点
- [x] z-team 侧三个 Service Facade 化 + `TeamTodoClient` 落地
- [x] z-team 侧 `TodoController` 改为同路径代理（前端零改动）
- [x] z-team 侧旧写路径删除（Mapper + SchemaPatcher）
- [x] z-team 的 `TeamTodoSpaceTool` 6 处调用补齐 userId
- [x] z-task 的 k8s Deployment 补 hostPath 持久卷 + `ZTASK_WORKSPACE_BASE_DIR`
- [x] z-task README 与源码对账（`ReadmeClaimsTest` 14 用例全绿）

### 7.2 运维侧（**待执行，代码不管**）

- [ ] **确认 z-task 的 base-dir 指向存量文件所在目录**（`/data/z_task`）——
      上线前到节点上核对 `ls /data/z_team/todo/`，应能看到存量项目空间目录。
      若为空 ⇒ 存量文件在别的路径，改 `ZTASK_WORKSPACE_BASE_DIR` 指过去。
- [ ] **执行存量搬迁** `z-task/_doc/002_deploy/init/migration_todo_from_z_team.sql`
      （`z_team_todo_project` → `z_task_todo_project`、`z_team_todo_item` → `z_task_todo_item`，
      保留 id / members JSON / extra_info JSON / tags JSON / links JSON / agent_id / agent_session_id）
- [ ] **执行后核对**：两侧表行数一致、`MAX(id)` 一致（id 值域保留是软外键有效的前提）
- [ ] **确认 z-team 的 `z-team.todo.base-url` 在生产生效**（生产以 `SPRING_APPLICATION_JSON` 覆盖 jar 内 yaml，
      两处都要是 `http://z-task-admin.z-task.svc.cluster.local:8082`）
- [ ] **确认 z-task 的 Deployment 副本数与 hostPath 兼容性**：当前 k3s 单节点，hostPath 有效；
      扩多节点前必须先换成 PVC（ReadWriteMany）
- [ ] **前端 TODO 面板零改动验证**：直接打 z-team 的 `/api/todo/**`，确认是代理到 z-task 的响应

### 7.3 前置条件（不在本次范围，但卡住后续发版）

- [ ] **主壳 z-opc 的 SB3 迁移** —— z-task 仓内已是 Spring Boot 3 / Java 17 字节码，
      主壳是 SB2 / Java 8。**z-task 后续任何抬版本的发版都会卡在这里。**
      本次 todo 迁移不需要抬 z-task 版本（HTTP 调用不需要共享 jar），但下一步就撞上。

---

## 8. 附：与 z-task 现有代码的两处不一致（顺手记录）

### 6.1 userId 取值不一致

- `z-task-web/.../api/ProjectController.java` → `u.getUserId()`
- `z-task-web/.../api/TaskController.java` → `u.getUsername()`

⇒ 同一张表里 `manager_id`（Project）与 `creator_id`（Task）可能存了**两种不同的用户标识**。
本次不动历史数据，但 **todo 新端点统一用 `getUserId()`**。

### 6.2 `Task.dueDate` 类型不匹配

`z-task-core/.../domain/entity/Task.java`：`private LocalDate dueDate;` 但 `@TableField("deadline")` 指向的列在 `schema.sql` 里是 `DATETIME`。
⇒ 取值时可能因类型不符抛异常或截断。本次不动，todo 用 `LocalDate` + `DATE` 列（与 z-team 一致）。
