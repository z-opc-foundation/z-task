# z-task

> 任务协作平台 —— 项目空间 / 看板 / 列表 / 任务卡片 / 指派 / 标签（看板范式，对标 Trello·Teambition）

一人公司基座里承担"事情怎么推进"这一层：把 z-ctc 签发的身份换成可协作的项目空间，
用 Project → Board → TaskList → Task 四级结构承载任务，拖拽排序由 `position` 字段落库，
成员与执行者关系各自独立成表，标签在项目内共享。**它是任务管理，不是定时调度** ——
仓内没有任何调度器实现（实测 fat jar 依赖树里没有 quartz 一件），与 z-schedule 的联动至今只是规划。

---

## 📋 基本信息

| 字段 | 值 |
|------|-----|
| **仓库** | `z-task`（`git@github.com:z-opc-foundation/z-task.git`，分支 `main`） |
| **Maven 坐标** | `io.github.yuku123:z-task:1.0.1`（根 POM `packaging=pom`；**没有 `<revision>` 属性**，版本是直写的 `<version>1.0.1</version>`，三个子模块的 parent 逐字同一面值） |
| **父项目** | `io.github.yuku123:z-boot-parent:1.2.4`（`<relativePath/>` 留空，parent 在 repo1 不在磁盘）；父链自带第三方地板与兄弟仓权威表 |
| **Maven Central** | 已发布（2026-09-30 实测 200）：`z-task:1.0.0`（pom）、`z-task-core:1.0.0`、`z-task-web:1.0.0`（pom + jar 均可拉）；未发布（2026-09-30 实测 404）：`z-task-admin`、`z-task-frontend` |
| **默认端口** | `8082`（`server.port`，`server.servlet.context-path: /`）· Docker 容器内 `8080` · 前端 Vite dev `3009`（`_frontend/z-task-suit/vite.config.js`） |
| **运行口径** | Java 17（parent 下发 `maven.compiler.source/target=17`）· Spring Boot 3.3.13（实测产物 `spring-boot-2.7.18.jar`） |
| **模块数** | reactor 内 3 个 Maven 模块（`z-task-core` / `z-task-web` / `z-task-admin`）；`_frontend` 有独立 pom 但已被移出 `<modules>` |
| **最近更新** | 2026-10-20 |

中央消费方实测：`z-opc/pom.xml` 的 dependencyManagement 已把 `z-task-core` / `z-task-web` 指向
`io.github.yuku123:*:1.0.1`，`z-opc/z-opcs-bridge`、`z-opc/bootstraps/z-opc-main-starter` 直接依赖这两件；
`z-task-admin` 从该列删除（本仓 central profile 的 `excludeArtifacts` 也把它排除出 bundle）。

---

## 🎯 能力清单

每条都能对应到 `z-task-web/.../web/api/` 的 Controller 或 `z-task-core/.../core/service/` 的 Service：

| 能力 | 实现 | 关键逻辑 |
|------|------|----------|
| 项目空间 | `ProjectController` / `ProjectBizServiceImpl` → `ProjectDomainServiceImpl` | 创建、修改、归档（`status` 0 归档 / 1 正常）、按用户列项目；`visibility` 控公开/私有 |
| 成员与角色 | `ProjectMemberController` / `ProjectMemberServiceImpl` | `z_task_project_member(project_id, user_id, role)`；`isMember` 是所有写操作的权限闸门 |
| 看板 | `BoardController` / `BoardServiceImpl` | 项目下多看板，`type` + `sortOrder`，`PUT /api/board/sort` 调序 |
| 任务列表 | `TaskListController` / `TaskListServiceImpl` | 看板下的列（`board_id` + `sortOrder` + `is_archived`），支持归档与排序 |
| 任务卡片 | `TaskController` / `TaskServiceImpl` | 创建校验"列表存在 + 是项目成员"，默认 `priority=1`、`status=0`、`position=列表内条数` |
| 拖拽移动 | `TaskController.move` → `TaskMapper.updatePosition` | 一条 `@Update` 同时改 `list_id` + `position` + `gmt_modified`（跨列与同列同一条 SQL） |
| 多人执行者 | `TaskAssigneeMapper` / `POST /api/task/assignees/{add,remove}` | `z_task_task_assignee(task_id, user_id)`，"按负责人查任务"走 `INNER JOIN` 再按 `deadline` 排序 |
| 标签体系 | `LabelController` / `TaskLabelController` | 项目级标签（`name` + `color`），任务与标签通过 `z_task_task_label` 挂/摘 |
| 完成与重开 | `TaskController.complete` / `reopen` | 写 `completed_at`，状态在 2 已完成 与 0 待办 之间切换 |
| 用户镜像 | `SyncUserController` / `SyncUserServiceImpl` | `z_task_sync_user` 落 z-ctc 侧用户（`username/nickname/email/avatar/status/source/last_sync_at`） |
| 统一鉴权 | `z-ctc-sso`（`SsoInterceptor`，实测产物 `z-ctc-sso-1.0.2.jar`） | Controller 从 request attribute `ssoUser` 取 `UserInfo.getUsername()` 当 userId |

---

## 🏗️ 项目结构

```
z-task/
├── pom.xml                # 根聚合 POM：parent z-boot-parent:1.2.4、常开 flatten(oss)、central profile
├── Dockerfile             # eclipse-temurin:8-jdk，容器内 SERVER_PORT=8080
├── LICENSE                # MIT License
├── z-task-core/           # 领域层：11 个实体 + 11 个 Mapper + Service 接口/实现 + 决策层单测
├── z-task-web/            # HTTP 层：api/ 10 个 Controller（Req/Resp DTO）+ TaskMyBatisConfig + spring.factories
│   └── src/main/resources/static/   # 前端构建产物（9 个文件已提交进 git，随 jar 发布）
├── z-task-admin/          # 可执行启动模块：ZTaskAdminApplication + WebMvcConfig + application.yml
├── _frontend/             # React 19 前端（Vite 6），独立 npm 工程，不在 Maven reactor
│   └── pom.xml            # frontend-maven-plugin 形态保留但已从 <modules> 注释掉
└── _doc/                  # 文档与 SQL、脚本，见文末「文档目录」
```

- **不参与发布的两格**：`z-task-admin` 只有 `SpringApplication` 主类，`spring-boot-maven-plugin` 的
  repackage 不带 classifier，产物是执行 fat jar（实测 `z-task-admin/target/z-task-admin-1.0.1.jar`，
  约 69 MB），不是别仓可引的库件 → 根 POM central profile 的 `excludeArtifacts` 点名排除。
  `_frontend` 已整模块移出 reactor（`_frontend/pom.xml` 要下载 nodejs，产物早已提交到
  `z-task-web/src/main/resources/static`）。
- **组件注册只有一处**：`z-task-web/src/main/resources/META-INF/spring.factories` 指向
  `ZTaskWebAutoConfiguration`，它以 `FullyQualifiedAnnotationBeanNameGenerator` 扫描
  `z.task.web` / `z.task.core.service(.impl)` / `z.task.core.domain.service(.impl)`；
  `ZTaskStarterApplication` 只扫自己包，避免双扫描导致 `NoUniqueBeanDefinitionException`。
- **数据源手工装配**：`TaskMyBatisConfig extends ModuleDataSourceTemplate`，注册
  `dataSourceTask`（`buildDataSource(env, "task")`）与 `sqlSessionFactoryTask`，并
  `@MapperScan` 到 `core.domain.mapper`；`application.yml` 里排除了
  `DataSourceAutoConfiguration` / `DruidDataSourceAutoConfigure` / `MybatisPlusAutoConfiguration`
  等四项自动装配，防止它们抢在手工工厂之前注册。

---

## 🧱 数据模型（实测 11 + 4 张表）

`z_task` 库；权威建表脚本 [`_doc/002_deploy/init/schema.sql`](_doc/002_deploy/init/schema.sql)，
存量库增量走 [`migration.sql`](_doc/002_deploy/init/migration.sql)。

| 表 | 实体 | 说明 |
|----|------|------|
| `z_task_project` | `Project` | `status` 0 归档 / 1 正常，`visibility`，`owner_id` |
| `z_task_project_member` | `ProjectMember` | `role`（整型），权限判定用 |
| `z_task_board` | `Board` | `type` + `sort_order` |
| `z_task_task_list` | `TaskList` | `board_id` + `sort_order` + `is_archived` |
| `z_task_task` | `Task` | `priority` 0低/1中/2高/3紧急、`status` 0待办/1进行中/2已完成、`position`（拖拽）、`list_id`/`board_id` |
| `z_task_task_assignee` | `TaskAssignee` | 一任务多执行者 |
| `z_task_label` | `Label` | 项目级标签，`color` |
| `z_task_task_label` | `TaskLabel` | 任务↔标签 |
| `z_task_sync_user` | `SyncUser` | z-ctc 用户镜像 |
| `z_task_todo_project` | `TodoProject` | 待办-项目（2026-11-02 自 z-team 迁入）：`visibility` 可见性、`members` 成员 JSON、`extra_info` 空间扩展信息 |
| `z_task_todo_item` | `TodoItem` | 待办-事项（2026-11-02 自 z-team 迁入）：`status` 字符串态 TODO/DOING/DONE/ARCHIVED、`priority` HIGH/MEDIUM/LOW、`parent_id` 父子树、`agent_id`/`agent_session_id` 指向 z-team 侧个人 Agent（跨仓软外键，不建物理外键） |
| `z_checklist` / `z_comment` / `z_attachment` / `z_activity` | —— | schema.sql 已建表，**代码里没有任何实体或 Mapper**（实测全仓 grep 只命中 SQL 与旧架构稿），属未接入的预留表 |

`Task` 与 `Project` 通过 `@TableField` 把新字段名桥到旧列名（`title→name`、`dueDate→deadline`、
`createdAt/updatedAt→gmt_create/gmt_modified`、`creatorId→creator_id`）；schema.sql 已按桥接后的真实列名建表，
`TaskMapper` 的 `@Select` 用显式列名 + 别名，不依赖 MyBatis-Plus 自动 ResultMap。

---

## 🔧 技术栈

后端面值全部**实测自 `z-task-admin/target/z-task-admin-1.0.0.jar` 的 `BOOT-INF/lib`**（2026-09-30 构建产物，当时版本还是 1.0.0），
不是从 pom 猜的：

| 层级 | 实测版本 |
|------|----------|
| 语言 / 运行时 | Java 17（Docker 基础镜像 `eclipse-temurin:8-jdk`） |
| 框架 | Spring Boot 2.7.18（由 `z-boot-parent:1.2.4` 下发） |
| 持久层 | MyBatis-Plus 3.5.7 + mybatis 3.5.16 + Druid 1.2.23 |
| 数据库驱动 | mysql-connector-j 8.4.0（生产 MySQL 8.0；仓内**没有** H2，profile `dev` 无对应 `application-dev.yml`） |
| 模块数据源 | `z-boot-datasource-starter:1.0.21` 的 `ModuleDataSourceTemplate`，配置前缀 `z.base.db.task.*` |
| 基座 | `z-boot-web-starter:1.0.21`（含 Knife4j 4.1.0 + springdoc-openapi 1.6.15）、`z-util-core:1.0.14` |
| 鉴权 | `z-ctc-sso:1.0.2`（只引 SSO 那一层，**不依赖** `z-ctc-web`） |
| 日志 | Log4j2 2.25.4（`z-boot-web-starter` 默认口径） |
| YAML | snakeyaml 2.0（根 POM 唯一的第三方 dependencyManagement 直接条目，顶住 Boot 自带的 1.30） |
| 测试 | junit-jupiter（api + engine）+ spring-boot-test，无 Mockito |
| 前端 | React 19.2 + Ant Design 6.3.3 + Vite 6.2 + react-router-dom 7.13 + axios，复用 `@yuku123/z-frontend-common` **1.x**（`z-task-suit` 侧 `^1.0.1`、`z-task-component` 侧 `^1.1.1`；面值见 `_frontend/z-task-suit/package.json`） |

> 注意：`_frontend/README.md` 仍写着 "React 18 / Vite 5 / Ant Design 5"，与其 `package.json` 不符；
> `_doc/001_arch/01-module-structure.md` 写的是 Vue 3 + Spring Boot 2.7.12，
> `03-split-from-z-opc.md` 写的是 parent `com.zifang:z-opc:1.0.1-SNAPSHOT` —— 这三处都是拆分前的历史稿，
> 以本 README 与 POM/package.json 为准。

---

## 🚀 快速开始

### 编译（需要能解析到 repo1 上的 z-boot-parent:1.2.4）

```bash
cd z-task
mvn clean install -DskipTests
```

模块 POM 里不写字面第三方版本；若报"找不到版本"，先确认能解析
`io.github.yuku123:z-boot-parent:1.2.4`（其父 `z-boot:1.0.19`；第三方地板与兄弟仓权威表均已并进 parent 自身）。

### 起后端

```bash
# 方式一：跑 reactor 里 repackage 出的执行 fat jar（无 classifier）
java -jar z-task-admin/target/z-task-admin-1.0.1.jar

# 方式二：Maven 插件直接跑
mvn -pl z-task-admin spring-boot:run
```

监听 `http://localhost:8082/`，前端 SPA 静态资源就在同进程的 `classpath:/static/`，
接口文档 `http://localhost:8082/doc.html`（Knife4j，已在 SSO `exclude-paths` 放行）。

### 数据源与环境变量

`z.base.db.task.*` 逐项缺省回退 `z.base.db.default.*`（由 `ModuleDataSourceTemplate` 决定）。
`application.yml` 只留环境变量占位，**仓库内不落任何真实口令**：

| 环境变量 | 对应键 | yml 内的缺省 |
|----------|--------|--------------|
| `ZTASK_DB_HOST` | `z.base.db.task.host` | `127.0.0.1` |
| `ZTASK_DB_PORT` | `z.base.db.task.port` | `3306` |
| `ZTASK_DB_NAME` | `z.base.db.task.database` | `z_task` |
| `ZTASK_DB_USER` | `z.base.db.task.username` | `root` |
| `ZTASK_DB_PASSWORD` | `z.base.db.task.password` | 空串（生产必须注入） |

口令只允许以环境变量形式注入，不要写进 yml / jar / 镜像层。
`spring.profiles.active` 写死为 `dev`，但仓内**没有** `application-dev.yml`，所以 profile 目前不带来任何配置差异；
`application.yml` 里的 `server.port` 可被同名环境变量 `SERVER_PORT` 覆盖（Dockerfile 正是这么把容器内端口改成 8080 的）。

### 起前端

```bash
cd _frontend
npm install
npm run dev      # Vite 监听 3009，/api 代理到 http://localhost:8888（见 _frontend/z-task-suit/vite.config.js）
npm run build    # 产物在 _frontend/dist，需人工拷到 z-task-web/src/main/resources/static
```

---

## 🔌 API 一览

全部端点由 `z-task-web/src/main/java/com/zifang/z/task/web/api/` 的 10 个 Controller 提供，前缀 `/api/...`；
统一返回 `com.zifang.util.core.meta.Result`（实测类字段为 `data / success / code / message`，
[`_doc/001_arch/`](_doc/001_arch/) 里写的 `msg` 是旧稿叫法）；下表为逐类实测的完整路径。

| 路径 | 方法 | Controller / 用途 |
|------|------|--------------------|
| `/api/project/user/list` | GET | `ProjectController.listByUser` |
| `/api/project` | POST / PUT | 创建、修改项目 |
| `/api/project/archive` | PUT | 归档 |
| `/api/project-member/user/projects` | GET | 用户可访问项目 |
| `/api/project-member/project/user` | GET / DELETE | 查成员 / 移除成员 |
| `/api/project-member/project/user/role` | POST | 加成员并设角色 |
| `/api/board/project`、`/api/board` | GET | 按项目列看板 / 单查 |
| `/api/board` | POST / PUT / DELETE | 看板增改删 |
| `/api/board/sort` | PUT | 看板调序 |
| `/api/task-list/board`、`/list`、`/page` | GET | 按看板取列 / 别名查询 / 分页 |
| `/api/task-list` | GET / POST / PUT / DELETE | 列的增删改查 |
| `/api/task-list/archive`、`/sort` | PUT | 列归档 / 调序 |
| `/api/task/list?listId=` | GET | 按列查任务 |
| `/api/task/project/list?projectId=` | GET | 按项目查任务 |
| `/api/task/assignee/list?userId=`（兼容 `assignee=`） | GET | 按执行者查任务 |
| `/api/task` | POST | 创建任务 |
| `/api/task/move?taskId=&targetListId=&position=` | PUT | 拖拽移动 |
| `/api/task/assignees/add`、`/remove` | POST | 执行者增删 |
| `/api/task/complete`、`/reopen` | POST | 完成 / 重开 |
| `/api/label/project` | GET | 项目标签列表 |
| `/api/label` | POST / DELETE | 标签增删 |
| `/api/task-label/task`、`/label` | GET | 按任务/按标签查关联 |
| `/api/task-label/task/label/attach` | POST | 打标签 |
| `/api/task-label/task/label/detach` | DELETE | 摘标签 |
| `/api/sync-user?userId=` | GET | 查镜像用户（机对机，需 `X-ZTask-Sync-Token`，见「用户同步鉴权」） |
| `/api/sync-user/sync` | POST | 写入/更新镜像用户（机对机，需 `X-ZTask-Sync-Token`；写库） |
| `/api/todo/projects` | GET / POST | 待办项目列表（owner + joined）/ 新建 |
| `/api/todo/projects/{id}` | GET / PUT / DELETE | 取单个项目 / 更新 / 删除 |
| `/api/todo/projects/{id}/members` | POST | 加项目成员 |
| `/api/todo/projects/{id}/members/{userId}` | DELETE | 移除项目成员 |
| `/api/todo/projects/reorder-batch` | POST | 项目批量排序 |
| `/api/todo/items` | GET / POST | 事项列表 / 新建 |
| `/api/todo/items/{id}` | PUT / DELETE | 更新事项 / 删除 |
| `/api/todo/items/{id}/complete`、`/reopen` | POST | 完成 / 重开 |
| `/api/todo/items/{id}/reorder` | POST | 同组排序 |
| `/api/todo/items/reorder-batch` | POST | 事项批量排序 |
| `/api/todo/items/{id}/dispatch-agent`、`/undispatch-agent` | POST | 标记已派发 / 解除派发（Agent 会话本身仍在 z-team 侧） |
| `/api/todo/projects/{id}/space/tree` | GET | 项目空间目录树 |
| `/api/todo/projects/{id}/space/file` | GET / PUT / DELETE | 读 / 写 / 删空间文件 |
| `/api/todo/projects/{id}/space/dir` | POST | 新建空间目录 |
| `/api/todo/projects/{id}/space/search` | GET | 空间文件全文检索 |
| `/api/todo/cross/notes/tree`、`/notes/{id}` | GET / PUT / DELETE | 个人笔记（**跨域反向代理到 z-team**，下同） |
| `/api/todo/cross/notes/{id}/favorite` | POST / DELETE | 收藏 / 取消收藏笔记 |
| `/api/todo/cross/personal-agents` | GET | 个人 Agent 列表（待办「交给 Agent」的候选） |
| `/api/todo/cross/staff/search` | GET | 员工目录搜索（指派候选） |
| `/api/todo/cross/scenario-instances` | GET / POST | 群聊场景实例（待办「所属项目」的关联对象） |
| `/api/todo/cross/chat-images` | POST | 待办详情里的图片上传（markdown 粘贴图片） |

启动后可用 Knife4j 浏览完整 OpenAPI：`http://localhost:8082/doc.html`。

---

## 🧪 测试

```bash
mvn -pl z-task-core test
```

`z-task-core/src/test` 下三个决策层单测类：`TaskServiceImplTest`、`TaskListServiceImplTest`、
`ProjectBizServiceImplTest`；支撑类 `support/Proxies` 用 JDK 动态代理 + 反射注入按方法名分发返回值，
内存 Map 充当存储 —— **零 Mockito、零 DB 依赖**（家法：不引 Mockito）。
`TodoSpaceServiceTest` 是待办项目空间的文件沙箱守卫（真实文件系统断言，14 个用例）。
`z-task-admin` 另有 `E2ESqlMigrationRunnerTest`（迁移脚本端到端）与
`SyncUserTokenInterceptorTest`（`/api/sync-user/**` 专用 token 闸门：无 token / 错 token /
未配置 token / 正确 token 四种鉴权场景 + 拦截器注册契约）；`z-task-web` 目前没有测试类
（闸门实现在 web、测试放在依赖它的 admin 模块执行）。

本轮 README 更新按作业单要求未执行 `mvn`（禁止跑构建），所以这里只登记"用例数与构造方式"实测结论，
不声明"跑绿"；`z-task-admin/target` 下存在 1.0.0/1.0.1 产物可反证该 reactor 能构建成功。

> 2026-10-20 复核：已实跑 `mvn -o test`，`z-task-core` 与 `z-task-admin` 两组用例全绿、BUILD SUCCESS；
> 上面那段「未执行 mvn」是 2026-09-30 那轮的原文，按「历史叙述不改」原样保留。
> 本仓 README 的定量主张由 `z-task-core/src/test/java/com/zifang/z/task/core/ReadmeClaimsTest.java` 守卫：
> 版本、reactor 模块清单、Controller 名单、实体与 Mapper 数量、默认端口、数据源环境变量、
> 表数量、前端工程与 Vite 端口、文档目录逐条对着源码重算，README 改了就红。
接口级验证需要真实 MySQL：先跑 [`schema.sql`](_doc/002_deploy/init/schema.sql) 建 `z_task` 库，
再注入 `ZTASK_DB_*` 环境变量启动。

---

## 🐳 部署

```bash
sh _doc/003_script/package.sh   # mvn clean + install -DskipTests（脚本内另有前端步骤，见下方风险）
sh _doc/003_script/build.sh     # docker build + 平滑换容器 + 健康检查 + 回滚
sh _doc/003_script/start.sh     # 打包后 mvn spring-boot:run
```

- [`Dockerfile`](Dockerfile)：`eclipse-temurin:8-jdk`，`WORKDIR /app`，`ENV SERVER_PORT=8080`，
  `EXPOSE 8080`，`HEALTHCHECK` 打 `http://127.0.0.1:8080/doc.html`，`ENTRYPOINT ["java","-jar","app.jar"]`。
- [`_doc/003_script/build.sh`](_doc/003_script/build.sh)：`HOST_PORT=8082` → `CONTAINER_PORT=8080`，
  先 `docker rename` 旧容器再启新容器，健康检查 30 秒不过则回滚旧容器。
- 仓根有 `deploy/`（Dockerfile + k8s 清单，2026-10-30 火车补齐部署面）与 Dockerfile；没有 `docker-compose*.yml`、`Makefile`。

### ⚠️ 已知风险与待修项（实测）

| 级别 | 内容 |
|------|------|
| ~~P1 已闭环~~ | `/api/sync-user/**` 本轮已补上专用 service token 鉴权（见下「用户同步鉴权」）：已从 `sso.exclude-paths` 移除，未配置 token 时端点 401 fail-closed；旧「免鉴权 / 没有 service token 机制 / 已知风险」口径作废 |
| P1 | [`Dockerfile`](Dockerfile) 的 `COPY z-task-admin/target/z-task-admin-1.0.1-SNAPSHOT.jar app.jar` 已过时：版本换 1.0.1 后实际产物是 `z-task-admin-1.0.1.jar`（无 classifier），照此 `docker build` 会 COPY 失败。本轮只改 README，脚本与 Dockerfile 待单独纠偏 |
| P2 | [`_doc/003_script/package.sh`](_doc/003_script/package.sh) 仍 `cd z-task-frontend`（实际目录是 `_frontend`），并把 dist 拷进 `z-task-admin/src/main/resources/static`（该目录不存在，静态资源实际在 `z-task-web/src/main/resources/static`）；另硬编码了作者本机 `JAVA_HOME` |
| P2 | DB 走 `z.base.db.task.*`，未注入时回退 `127.0.0.1:3306` / `root` / 空口令 —— 服务能起，但业务接口会因连不上库而失败 |
| P2 | z-wf（原 z-camuda，2026-11-17 退役归档后由 z-wf-admin 兼容层承接；审批转任务）、z-schedule（到期提醒）联动为规划项，本仓代码未落地；`z_checklist` / `z_comment` / `z_attachment` / `z_activity` 四表建了但无实体 |

### 🔐 用户同步鉴权（机对机，已闭环）

`/api/sync-user/**` 是服务间同步用户镜像数据的入口（`POST /api/sync-user/sync` 会写
`z_task_sync_user`），没有用户 SSO cookie，因此**不套用用户 SSO 拦截**：`SyncUserController`
标注 `@NoLogin` 让 z-ctc-sso 的用户态闸门放行，改由 `SyncUserTokenInterceptor` 独立校验专用
service token。已从 `sso.exclude-paths` 移除 `/api/sync-user/**`，旧「免鉴权 / 已知风险」口径作废。

| 项 | 值 / 口径 |
|----|-----------|
| 服务端环境变量 | `ZTASK_SYNC_USER_TOKEN`（对应配置 `z-task.sync-user.token`） |
| 调用方请求头 | `X-ZTask-Sync-Token: <token>` |
| 未配置 token | 该组端点**一律返回 401（fail-closed）**，绝不静默放行 |
| 缺失 / 错误 token | 401；比对用 `MessageDigest.isEqual` 常量时间；token 不进日志、不回显 |

> **跨仓联动**：调用本端点的机对机发起方（含任何前端 / 网关代理）需同步带上上述请求头。
> z-opc 仓 `z-opc-main-starter-frontend/src/api/types/schema.d.ts` 是 OpenAPI 生成的类型快照，
> 若重新生成需一并带上该 header 声明。本仓内无调用方（`_frontend` 无引用，service 是被调方），
> 故本轮无需改仓内调用点。

---

## 版本沿革

| 面值 / 提交 | 内容 |
|-------------|------|
| —— · `1f37340` | 启动模块 `z-task-starter` 改名 `z-task-admin`（模块划分对齐组织规范）；本 README 中所有启动模块路径已同步 |
| `1.0.1` · `44f55fc` | 坐标换 `io.github.yuku123:z-task:1.0.1`（原 `com.zifang:z-task:1.0.1-SNAPSHOT`），补 central 发布通道（flatten(oss) 常开 + `excludeArtifacts z-task-starter`），`z-task`/`z-task-core`/`z-task-web` 三件上中央；Java 包名保持 `com.zifang.*` |
| —— · `6661606` | 消费入口抬到 `z-boot-parent:1.2.4`（Spring Boot 随之回到 2.7.18，此前 README/文档写的 2.7.12 已失效） |
| —— · `c2e0e9d` | 消费入口从悬空的 `com.zifang:z-opc` 换成 `io.github.yuku123:z-boot-parent:1.2.4`，删除四个死属性（`z-boot.version` / `z-ctc.version` / `knife4j.version` / `java.version`） |
| `2026-09-24` · `394fcf7` | 对齐 z-boot 家族标准架构：配置去明文凭证改环境变量、删除死配置 `spring.datasource`、`TaskController` 迁移到 `api/` + Req/Resp DTO、SQL 三方漂移收口为权威 `schema.sql`、补 37 例决策层单测 |
| `2026-09-06` · `40e3b9c` | 从 z-opc monorepo 拆出独立仓（组织级历史塌缩） |

---

## 📄 License

MIT License，见根 [`LICENSE`](LICENSE)（`Copyright (c) 2026 z-opc-foundation`），根 POM `<licenses>` 同声明 MIT License。

_Maintained by the z-opc-foundation organization._

---

## 文档目录

本项目文档统一收口在 `_doc/` 下：

- [`_doc/001_arch/`](_doc/001_arch/) — 架构与功能文档：
  - [`00-overview.md`](_doc/001_arch/00-overview.md) — 项目总览（模块定位 / 核心概念 / 端口 / API 面貌 / 已知风险），最贴近当前代码
  - [`01-module-structure.md`](_doc/001_arch/01-module-structure.md) — 早期详细架构稿（819 行，含 Vue 3 / Spring Boot 2.7.12 等**拆分前**面值，仅作历史参考）
  - [`03-split-from-z-opc.md`](_doc/001_arch/03-split-from-z-opc.md) — 拆分来源说明（旧 parent `com.zifang:z-opc`，现已不适用）
  - [`02-feature.md`](_doc/001_arch/02-feature.md) — 功能设计与优先级矩阵
- [`_doc/002_deploy/init/`](_doc/002_deploy/init/) — SQL：
  - [`schema.sql`](_doc/002_deploy/init/schema.sql) — **权威建表入口**（建库 `z_task` + 9 张 `z_task_*` 表 + 4 张预留表）
  - [`migration.sql`](_doc/002_deploy/init/migration.sql) — 存量库增量（非幂等，报"列已存在"可忽略）
- [`_doc/003_script/`](_doc/003_script/) — 运维脚本：
  - [`build.sh`](_doc/003_script/build.sh) — docker 构建 + 平滑替换 + 健康检查回滚
  - [`package.sh`](_doc/003_script/package.sh) — 打包（路径已过时，见上方 P2）
  - [`start.sh`](_doc/003_script/start.sh) — 打包后 `mvn spring-boot:run`
- [`_doc/002_deploy/`](_doc/002_deploy/) 无 Docker/K8s 清单，`_doc/004_skill/` 本仓不存在；仓根也没有 `db/` 目录，表结构一律以上面 `schema.sql` 为准。

配置面详见 [`z-task-admin/src/main/resources/application.yml`](z-task-admin/src/main/resources/application.yml)，
前端说明见 [`_frontend/README.md`](_frontend/README.md)（版本面值以 `_frontend/z-task-component/package.json` 与
`_frontend/z-task-suit/package.json` 为准；本仓无 `z-task-starter` 模块，模块为 admin / core / web 三件）。

---

<!-- z-opc-foundation-sibling-registry:v1 -->
## 🔗 兄弟仓全景（z-opc-foundation 组织）

本仓隶属于 [z-opc-foundation](https://github.com/orgs/z-opc-foundation/repositories) 组织——一人公司基座的全部自研件（现存 61 仓，含私有仓；口径 2026-11-24 GitHub org API 实读）。

| 仓 | 一句话说明 |
|---|---|
| [z-agent](https://github.com/z-opc-foundation/z-agent) | 云端 Agent 平台的库与 starter——ReAct/Plan 实现 + 注册中心 + REST 网关 + 只读控制面 |
| [z-agent-kernel](https://github.com/z-opc-foundation/z-agent-kernel) | Agent 框架基座——消息/工具/记忆/provider/会话 SPI + 轻量默认实现（纯 POJO 无 Spring） |
| [z-asset](https://github.com/z-opc-foundation/z-asset) | 企业资产台账——实物设备全生命周期 + 域名/证书/许可到期提醒 |
| [z-audit](https://github.com/z-opc-foundation/z-audit) | 审计与合规留痕——事件模型 + 哈希链 + 事件出口 SPI + 留存期策略 |
| [z-biz](https://github.com/z-opc-foundation/z-biz) | 商务外壳域——客户/合同/票据/对账四聚合 |
| [z-biz-erp](https://github.com/z-opc-foundation/z-biz-erp) | 进销存 ERP——商品/客商/采购/销售/库存流水/应收应付核销（z-biz 业务线） |
| [z-biz-security](https://github.com/z-opc-foundation/z-biz-security) | 业务数据安全防护入口——场景化策略注册 + 安全线四段流水线对外编排 |
| [z-boot](https://github.com/z-opc-foundation/z-boot) | Spring Boot Starter 聚合仓 + 版本权威（火车制）——唯一消费入口 z-boot-parent |
| [z-bot](https://github.com/z-opc-foundation/z-bot) | 本地 agent 应用——终端 CLI + HTTP/SSE web 控制台 + 多通道 gateway（飞书/钉钉/webhook） |
| [z-cache](https://github.com/z-opc-foundation/z-cache) | RESP2 协议兼容的分布式内存缓存——Java 8 + Netty，Redis 客户端零修改直连 |
| [z-camuda](https://github.com/z-opc-foundation/z-camuda) | 【已退役·归档】基于 Camunda 的工作流封装层（原 z-wf 改名，与现行 z-wf 无共同历史） |
| [z-cognition](https://github.com/z-opc-foundation/z-cognition) | 业务认知域/认知舱——术语/概念/证据链 + memory/kb/ontology 渐进式模块 |
| [z-config](https://github.com/z-opc-foundation/z-config) | 分布式配置中心 + 服务注册中心（类 Nacos）——Netty 长连接推送 + React 控制台 |
| [z-ctc](https://github.com/z-opc-foundation/z-ctc) | 4A 中心——认证/授权/账户/审计，多租户 JWT + SSO 跨子域 |
| [z-dms](https://github.com/z-opc-foundation/z-dms) | 数据源管控底座——统一登记、统一建池、统一探活、变更统一推送 |
| [z-env](https://github.com/z-opc-foundation/z-env) | 本地中间件与基础设施环境——31 个 docker-compose 场景 + make 一键运维 |
| [z-etl](https://github.com/z-opc-foundation/z-etl) | ETL 引擎——DataX 式线性作业 + Flink 式 DAG 流管道（键控状态/水位/窗口） |
| [z-ext](https://github.com/z-opc-foundation/z-ext) | Java 扩展点框架——@ExtPoint/@ExtImpl 运行期选实现，五档侵入方式 |
| [z-frontend-common](https://github.com/z-opc-foundation/z-frontend-common) | 全仓共享前端基座——AppLayout/LoginPage 等前端规范的唯一承载 |
| [z-frontend-markdown](https://github.com/z-opc-foundation/z-frontend-markdown) | Markdown 通用共享组件包（npm）——MarkdownLiveEditor/NoteMarkdown/MermaidBlock 单一真源 |
| [z-frontend-render](https://github.com/z-opc-foundation/z-frontend-render) | 平台共享前端渲染引擎——后端 schema 是唯一事实源，报表与低代码共用 |
| [z-graph](https://github.com/z-opc-foundation/z-graph) | 独立图数据库——MVCC 版本链存储 + OpenCypher 子集 + Bolt 风格协议 + React 控制台 |
| [z-gw](https://github.com/z-opc-foundation/z-gw) | 自研高性能 API 网关——Netty 手写运行时，Route/Predicate/Filter 模型可嵌 Spring Boot |
| [z-indexer](https://github.com/z-opc-foundation/z-indexer) | 代码索引服务——仓库注册表 + 定时重建索引 + 符号/调用链查询 |
| [z-introduce](https://github.com/z-opc-foundation/z-introduce) | 组织仓库展示站——全仓实测元数据汇总成可搜索静态站点 |
| [z-lc](https://github.com/z-opc-foundation/z-lc) | 低代码平台——DB 驱动通用 CRUD 引擎 + 报表/模型设计框架 |
| [z-llm-agent](https://github.com/z-opc-foundation/z-llm-agent) | CLI Agent 服务化——把本机 CLI agent（CC/Hermes/Qoder 等）暴露成 OpenAI 兼容对话 API |
| [z-llm-gateway](https://github.com/z-opc-foundation/z-llm-gateway) | LLM 网关——OpenAI/Anthropic 双协议面 + 多 vendor 凭据池、限流与 token 记账 |
| [z-llm-msghub](https://github.com/z-opc-foundation/z-llm-msghub) | msgHub 中心消息路由——WebSocket 中心枢纽 + Agent 侧客户端 SDK |
| [z-mask](https://github.com/z-opc-foundation/z-mask) | 脱敏与遮蔽引擎——按敏感命中位置遮蔽，策略即数据 |
| [z-mcp](https://github.com/z-opc-foundation/z-mcp) | MCP 服务端 + 上游聚合网关——Java 8 手写协议层，Spring Boot 自动装配 |
| [z-meta](https://github.com/z-opc-foundation/z-meta) | 元数据管理平台——租户/应用/接口清单登记 + @BizModel 业务模型采集 |
| [z-mill](https://github.com/z-opc-foundation/z-mill) | 资料磨坊——全格式文档转 Markdown/JSON/纯文本/HTML（对标 MinerU） |
| [z-mist](https://github.com/z-opc-foundation/z-mist) | KMS 分布式密钥/秘密管理平台——集中加密存储 + Netty 协议 + starter 嵌入 |
| [z-mq](https://github.com/z-opc-foundation/z-mq) | 自研分布式消息队列——NameServer+Broker+Store，形状对标 RocketMQ、自有 Netty 协议 |
| [z-msg](https://github.com/z-opc-foundation/z-msg) | 多通道消息 + WebSocket 实时下发基础设施——短信/邮件/站内信/Webhook/IM 平台 |
| [z-observer](https://github.com/z-opc-foundation/z-observer) | 可观测性域——指标/日志/链路 + 告警引擎 |
| [z-opc](https://github.com/z-opc-foundation/z-opc) | 一人公司统一后端+统一前端——单 JVM all-in-one 承载协作/Agent/RPA/交易/资产等业务域与自研中间件 |
| [z-opc-foundation-lead](https://github.com/z-opc-foundation/z-opc-foundation-lead) | 组织治理大脑——事实表、强制规范、跨仓工具集、新机器恢复钥匙（本清单权威持有处） |
| [z-opcs](https://github.com/z-opc-foundation/z-opcs) | 任务撮合/服务市场——用户付费发布诉求，持有者接单完成，金额自动瓜分 |
| [z-ops](https://github.com/z-opc-foundation/z-ops) | 个人公司运维平台——部署单元/镜像构建/WebShell/K8s 巡检 + Ops Agent 执行器 |
| [z-oss](https://github.com/z-opc-foundation/z-oss) | 对象存储服务——自持 local 后端 + aliyun/s3 对接层，starter 注入 OssTemplate |
| [z-product](https://github.com/z-opc-foundation/z-product) | 产品设计信息汇总仓（开发域 PM 工件） |
| [z-qa](https://github.com/z-opc-foundation/z-qa) | 步骤式 API 链路测试平台——用例/计划/执行/报告/质量看板（对标 TestRail·MeterSphere） |
| [z-rpa](https://github.com/z-opc-foundation/z-rpa) | RPA 产品皮——应用市场/需求中心（执行归 z-script，触发归 z-schedule） |
| [z-rpc](https://github.com/z-opc-foundation/z-rpc) | Java 8 + Netty RPC 框架——微内核 + SPI 插件化，形状参照 Dubbo/gRPC |
| [z-schedule](https://github.com/z-opc-foundation/z-schedule) | 分布式任务调度中枢（对标 XXL-Job）——选主 + 时间环排期，starter 嵌入宿主 |
| [z-script](https://github.com/z-opc-foundation/z-script) | 多 DSL 脚本平台 + Mock 平台——沙箱执行/版本灰度/可注册 MCP Tool，starter 内嵌 |
| [z-security](https://github.com/z-opc-foundation/z-security) | 数据安全域编排层——场景→策略→识别→脱敏→水印→审计 四段流水线编排 |
| [z-sense](https://github.com/z-opc-foundation/z-sense) | 敏感识别与分类分级引擎——数据安全线底座（规则目录 + 可插拔识别器 + 分类分级） |
| [z-skill](https://github.com/z-opc-foundation/z-skill) | Skill 平台聚合器——归一化各家 Skill 形状，再按各家 API 形状发回 |
| [z-surl](https://github.com/z-opc-foundation/z-surl) | 短网址服务——短码生成/解析/命中统计，starter 一行集成 |
| [z-task](https://github.com/z-opc-foundation/z-task) | 任务协作平台——项目空间/看板/任务卡片（看板范式，对标 Trello·Teambition） **（本仓）** |
| [z-team](https://github.com/z-opc-foundation/z-team) | 数字员工协同域——全栈独立仓，自 z-opc 毕业 |
| [z-trade](https://github.com/z-opc-foundation/z-trade) | 交易域独立仓——自 z-opc reactor 迁出 |
| [z-util](https://github.com/z-opc-foundation/z-util) | 底层 Java 工具库——89 个模块 POM，Java 8/17 口径，按需引用按需升级 |
| [z-vector](https://github.com/z-opc-foundation/z-vector) | 自研 Java 向量数据库——嵌入式+可独立部署，ANN+Payload 过滤，兼容 Qdrant REST |
| [z-voice-demo](https://github.com/z-opc-foundation/z-voice-demo) | 语音链路 demo——流式识别→kernel LLM→流式 TTS→可打断 的契约验证实现 |
| [z-watermark](https://github.com/z-opc-foundation/z-watermark) | 水印引擎——显式文字/图片隐写/盲水印，三种技术成对「打+验」 |
| [z-webide](https://github.com/z-opc-foundation/z-webide) | 企业级 WebIDE 后端——Git 仓/共享目录秒变 code-server 实例，全生命周期管理 |
| [z-wf](https://github.com/z-opc-foundation/z-wf) | 自研流程引擎——不依赖 Camunda/Flowable，定义层与运行时全自研 |

**已退役仓**（迁至 [z-trash](https://github.com/z-trash) 组织，archived 只读）：

| 仓 | 说明 |
|---|---|
| [z-agent-proxy](https://github.com/z-trash/z-agent-proxy) | 三方 coding agent 适配代理（Aider/Cursor → kernel Agent SPI），2026-10-26 退役 |
| [z-kb](https://github.com/z-trash/z-kb) | 自研知识库系统（对标 LightRAG/RAGFlow），2026-11 并入 z-cognition 认知舱后退役 |
| [z-ontology](https://github.com/z-trash/z-ontology) | 本体层（TBox/ABox/RDFS 推理），并入 z-cognition 后退役 |

另有 [z-report](https://github.com/z-opc-foundation/z-report)（报表域，2026-10-11 撤销并入 z-lc（远端已删除））。

总清单权威持有处在 [z-opc-foundation-lead](https://github.com/z-opc-foundation/z-opc-foundation-lead) `008_组织规范/005_兄弟仓清单.md`。
