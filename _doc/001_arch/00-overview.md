# 001_项目总览

## 1.1 模块定位

z-task（任务中心）是面向个人和团队的轻量级任务协作平台（看板范式，对标 Teambition/Trello 的开源自研实现），
提供项目空间、看板/列表、任务卡片、指派、标签、成员协作能力。与 z-wf（审批流）和 z-schedule（定时调度）
规划集成，形成"审批 → 任务 → 提醒"的闭环。

## 1.2 核心概念

- **项目空间 (Project)**：项目内含看板、成员、标签体系
- **看板 (Board) → 列表 (TaskList) → 任务卡片 (Task)**：拖拽式三段结构，`position` 字段承载排序
- **指派 (TaskAssignee)**：一任务多执行者；**标签 (Label)**：项目级标签体系
- **成员镜像 (SyncUser)**：z-ctc 用户表向 z_task 的同步镜像

## 1.3 模块关系

```
z-ctc（用户/账号/4A 鉴权）──► z-task（SsoInterceptor + 用户同步）
z-wf（审批完成）──规划──► z-task（自动创建跟进任务）
z-schedule（定时调度）──规划──► z-task（到期任务通知）
```

## 1.4 服务端口

| 部署方式  | 端口   |
|-------|------|
| 独立运行 (z-task-starter) | 8082 |
| 前端 dev server (Vite) | 5800 (proxy → 8082) |
| 主应用集成 | 挂载于 z-opc 主应用, 端口随宿主 |

## 1.5 技术栈

| 组件           | 版本     | 来源 |
|--------------|--------|------|
| Java         | 8      | 父 POM |
| Spring Boot  | 2.7.12 | z-boot-dependencies BOM |
| MyBatis-Plus | 3.5.7  | z-boot-dependencies BOM |
| 数据源        | Druid + ModuleDataSourceTemplate (`z.base.db.task.*`) | z-boot-datasource-starter |
| Web/API 文档 | springdoc + knife4j | z-boot-web-starter (log4j2) |
| 认证         | z-ctc-web (4A SSO) | z-ctc |
| 前端         | React 19 + Ant Design 6 + Vite 6 | _frontend/ |

## 1.6 模块结构

```
z-task/
├── z-task-core/      # 实体/Mapper/Service 业务核心 (+ 决策层单测)
├── z-task-web/       # api/ 控制器 (Req/Resp DTO) + TaskMyBatisConfig + spring.factories
├── z-task-starter/   # Spring Boot 启动模块 (application.yml + SPA 路由转发)
└── _frontend/        # React 19 前端, 构建产物拷入 z-task-web/src/main/resources/static
```

**API 面貌**（均为 `/api/...` 前缀，返回 `Result{code,msg,data}`）：
`/api/project`, `/api/project-member`, `/api/board`, `/api/task-list`, `/api/task`,
`/api/label`, `/api/task-label`, `/api/sync-user`

**数据库**：`z_task` 库，9 张业务表（`z_task_*` 前缀）；权威 schema 见
`_doc/002_deploy/init/schema.sql`，存量库升级走 `migration.sql`。

**测试**：`z-task-core` 决策层单测 37 例（JDK 动态代理 + 内存 Map，零 Mockito，零 DB 依赖）。

## 1.7 已知风险

| 级别 | 内容 |
|-----|------|
| P1 | `/api/sync-user/**` 在 SSO exclude-paths 中免鉴权（服务端同步端点，无 service token 机制，部署时勿暴露公网） |
| P2 | z-wf / z-schedule 联动为规划项，代码未落地 |
| P2 | 实体通过 @TableField 桥接旧列名（title→name, dueDate→deadline, gmt_*），新表已按桥接后真实列名建表 |
