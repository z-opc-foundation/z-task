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
| **Maven 坐标** | `io.github.yuku123:z-task:1.0.0`（根 POM `packaging=pom`；**没有 `<revision>` 属性**，版本是直写的 `<version>1.0.0</version>`，三个子模块的 parent 逐字同一面值） |
| **父项目** | `io.github.yuku123:z-boot-parent:1.1.0`（`<relativePath/>` 留空，parent 在 repo1 不在磁盘）；父链自带第三方地板与兄弟仓权威表 |
| **Maven Central** | 已发布（2026-09-30 实测 200）：`z-task:1.0.0`（pom）、`z-task-core:1.0.0`、`z-task-web:1.0.0`（pom + jar 均可拉）；未发布（2026-09-30 实测 404）：`z-task-admin`、`z-task-frontend` |
| **默认端口** | `8082`（`server.port`，`server.servlet.context-path: /`）· Docker 容器内 `8080` · 前端 Vite dev `3009`（`_frontend/z-task-suit/vite.config.js`） |
| **运行口径** | Java 8（parent 下发 `maven.compiler.source/target=8`）· Spring Boot 2.7.18（实测产物 `spring-boot-2.7.18.jar`） |
| **模块数** | reactor 内 3 个 Maven 模块（`z-task-core` / `z-task-web` / `z-task-admin`）；`_frontend` 有独立 pom 但已被移出 `<modules>` |
| **最近更新** | 2026-10-20 |

中央消费方实测：`z-opc/pom.xml` 的 dependencyManagement 已把 `z-task-core` / `z-task-web` 指向
`io.github.yuku123:*:1.0.0`，`z-opc/z-opcs-bridge`、`z-opc/bootstraps/z-opc-main-starter` 直接依赖这两件；
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
├── pom.xml                # 根聚合 POM：parent z-boot-parent:1.1.0、常开 flatten(oss)、central profile
├── Dockerfile             # eclipse-temurin:8-jdk，容器内 SERVER_PORT=8080
├── LICENSE                # MIT License
├── z-task-core/           # 领域层：9 个实体 + 9 个 Mapper + Service 接口/实现 + 决策层单测
├── z-task-web/            # HTTP 层：api/ 8 个 Controller（Req/Resp DTO）+ TaskMyBatisConfig + spring.factories
│   └── src/main/resources/static/   # 前端构建产物（9 个文件已提交进 git，随 jar 发布）
├── z-task-admin/          # 可执行启动模块：ZTaskAdminApplication + WebMvcConfig + application.yml
├── _frontend/             # React 19 前端（Vite 6），独立 npm 工程，不在 Maven reactor
│   └── pom.xml            # frontend-maven-plugin 形态保留但已从 <modules> 注释掉
└── _doc/                  # 文档与 SQL、脚本，见文末「文档目录」
```

- **不参与发布的两格**：`z-task-admin` 只有 `SpringApplication` 主类，`spring-boot-maven-plugin` 的
  repackage 不带 classifier，产物是执行 fat jar（实测 `z-task-admin/target/z-task-admin-1.0.0.jar`，
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

## 🧱 数据模型（实测 9 + 4 张表）

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
| `z_checklist` / `z_comment` / `z_attachment` / `z_activity` | —— | schema.sql 已建表，**代码里没有任何实体或 Mapper**（实测全仓 grep 只命中 SQL 与旧架构稿），属未接入的预留表 |

`Task` 与 `Project` 通过 `@TableField` 把新字段名桥到旧列名（`title→name`、`dueDate→deadline`、
`createdAt/updatedAt→gmt_create/gmt_modified`、`creatorId→creator_id`）；schema.sql 已按桥接后的真实列名建表，
`TaskMapper` 的 `@Select` 用显式列名 + 别名，不依赖 MyBatis-Plus 自动 ResultMap。

---

## 🔧 技术栈

后端面值全部**实测自 `z-task-admin/target/z-task-admin-1.0.0.jar` 的 `BOOT-INF/lib`**（2026-09-30 构建产物），
不是从 pom 猜的：

| 层级 | 实测版本 |
|------|----------|
| 语言 / 运行时 | Java 8（Docker 基础镜像 `eclipse-temurin:8-jdk`） |
| 框架 | Spring Boot 2.7.18（由 `z-boot-parent:1.1.0` 下发） |
| 持久层 | MyBatis-Plus 3.5.7 + mybatis 3.5.16 + Druid 1.2.23 |
| 数据库驱动 | mysql-connector-j 8.4.0（生产 MySQL 8.0；仓内**没有** H2，profile `dev` 无对应 `application-dev.yml`） |
| 模块数据源 | `z-boot-datasource-starter:1.0.21` 的 `ModuleDataSourceTemplate`，配置前缀 `z.base.db.task.*` |
| 基座 | `z-boot-web-starter:1.0.21`（含 Knife4j 4.1.0 + springdoc-openapi 1.6.15）、`z-util-core:1.0.14` |
| 鉴权 | `z-ctc-sso:1.0.2`（只引 SSO 那一层，**不依赖** `z-ctc-web`） |
| 日志 | Log4j2 2.25.4（`z-boot-web-starter` 默认口径） |
| YAML | snakeyaml 2.0（根 POM 唯一的第三方 dependencyManagement 直接条目，顶住 Boot 自带的 1.30） |
| 测试 | junit-jupiter（api + engine）+ spring-boot-test，无 Mockito |
| 前端 | React 19.2 + Ant Design 6.3.3 + Vite 6.2 + react-router-dom 7.13 + axios，复用 `@yuku123/z-frontend-common` **1.x**（`z-task-suit` 侧 `^1.0.0`、`z-task-component` 侧 `^1.1.1`；面值见 `_frontend/z-task-suit/package.json`） |

> 注意：`_frontend/README.md` 仍写着 "React 18 / Vite 5 / Ant Design 5"，与其 `package.json` 不符；
> `_doc/001_arch/01-module-structure.md` 写的是 Vue 3 + Spring Boot 2.7.12，
> `03-split-from-z-opc.md` 写的是 parent `com.zifang:z-opc:1.0.0-SNAPSHOT` —— 这三处都是拆分前的历史稿，
> 以本 README 与 POM/package.json 为准。

---

## 🚀 快速开始

### 编译（需要能解析到 repo1 上的 z-boot-parent:1.1.0）

```bash
cd z-task
mvn clean install -DskipTests
```

模块 POM 里不写字面第三方版本；若报"找不到版本"，先确认能解析
`io.github.yuku123:z-boot-parent:1.1.0`（其父 `z-boot:1.0.19`；第三方地板与兄弟仓权威表均已并进 parent 自身）。

### 起后端

```bash
# 方式一：跑 reactor 里 repackage 出的执行 fat jar（无 classifier）
java -jar z-task-admin/target/z-task-admin-1.0.0.jar

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

全部端点由 `z-task-web/src/main/java/com/zifang/z/task/web/api/` 的 8 个 Controller 提供，前缀 `/api/...`；
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
| `/api/sync-user?userId=` | GET | 查镜像用户（**免鉴权**，见风险表） |
| `/api/sync-user/sync` | POST | 写入/更新镜像用户（**免鉴权**） |

启动后可用 Knife4j 浏览完整 OpenAPI：`http://localhost:8082/doc.html`。

---

## 🧪 测试

```bash
mvn -pl z-task-core test
```

`z-task-core/src/test` 下三个决策层单测类：`TaskServiceImplTest`、`TaskListServiceImplTest`、
`ProjectBizServiceImplTest`；支撑类 `support/Proxies` 用 JDK 动态代理 + 反射注入按方法名分发返回值，
内存 Map 充当存储 —— **零 Mockito、零 DB 依赖**（家法：不引 Mockito）。
`z-task-admin` 另有 `E2ESqlMigrationRunnerTest`（迁移脚本端到端）；`z-task-web` 目前没有测试类。

本轮 README 更新按作业单要求未执行 `mvn`（禁止跑构建），所以这里只登记"用例数与构造方式"实测结论，
不声明"跑绿"；`z-task-admin/target` 下存在 1.0.0 产物可反证该 reactor 能构建成功。

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
- 没有 `docker-compose*.yml`、`deploy/`、`k8s/`、`Makefile`（实测仓根不存在），部署面就是 Dockerfile + 三个脚本。

### ⚠️ 已知风险与待修项（实测）

| 级别 | 内容 |
|------|------|
| P1 | `/api/sync-user/**` 在 `sso.exclude-paths` 中**免鉴权**（服务端用户同步端点，没有 service token 机制）；独立部署时勿把该端口暴露公网 |
| P1 | [`Dockerfile`](Dockerfile) 的 `COPY z-task-admin/target/z-task-admin-1.0.0-SNAPSHOT.jar app.jar` 已过时：版本换 1.0.0 后实际产物是 `z-task-admin-1.0.0.jar`（无 classifier），照此 `docker build` 会 COPY 失败。本轮只改 README，脚本与 Dockerfile 待单独纠偏 |
| P2 | [`_doc/003_script/package.sh`](_doc/003_script/package.sh) 仍 `cd z-task-frontend`（实际目录是 `_frontend`），并把 dist 拷进 `z-task-admin/src/main/resources/static`（该目录不存在，静态资源实际在 `z-task-web/src/main/resources/static`）；另硬编码了作者本机 `JAVA_HOME` |
| P2 | DB 走 `z.base.db.task.*`，未注入时回退 `127.0.0.1:3306` / `root` / 空口令 —— 服务能起，但业务接口会因连不上库而失败 |
| P2 | z-camuda（审批转任务）、z-schedule（到期提醒）联动为规划项，本仓代码未落地；`z_checklist` / `z_comment` / `z_attachment` / `z_activity` 四表建了但无实体 |

---

## 版本沿革

| 面值 / 提交 | 内容 |
|-------------|------|
| —— · `1f37340` | 启动模块 `z-task-starter` 改名 `z-task-admin`（模块划分对齐组织规范）；本 README 中所有启动模块路径已同步 |
| `1.0.0` · `44f55fc` | 坐标换 `io.github.yuku123:z-task:1.0.0`（原 `com.zifang:z-task:1.0.0-SNAPSHOT`），补 central 发布通道（flatten(oss) 常开 + `excludeArtifacts z-task-starter`），`z-task`/`z-task-core`/`z-task-web` 三件上中央；Java 包名保持 `com.zifang.*` |
| —— · `6661606` | 消费入口抬到 `z-boot-parent:1.0.21`（Spring Boot 随之回到 2.7.18，此前 README/文档写的 2.7.12 已失效） |
| —— · `c2e0e9d` | 消费入口从悬空的 `com.zifang:z-opc` 换成 `io.github.yuku123:z-boot-parent:1.0.19`，删除四个死属性（`z-boot.version` / `z-ctc.version` / `knife4j.version` / `java.version`） |
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
