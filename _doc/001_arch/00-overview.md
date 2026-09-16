# 001_项目总览

## 1.1 模块定位

z-task（任务中心）是面向个人和团队的任务管理平台，提供任务创建、指派、跟踪、协作的全套能力。与 z-wf（审批流）和
z-schedule（定时调度）深度集成，形成"审批 → 任务 → 提醒"的闭环。

## 1.2 愿景

- **任务全流程**：任务创建 → 指派 → 执行 → 完成 → 归档
- **多视图支持**：看板视图（Board）、列表视图（TaskList）、甘特图（规划中）
- **项目隔离**：项目（Project）内含看板、成员、标签体系
- **标签与指派**：多标签分类、多人指派、截止日期
- **与审批联动**：z-wf 审批通过后自动在 z-task 创建跟进任务
- **定时提醒**：z-schedule 对截止日期临近的任务发送提醒

## 1.3 模块关系

```
z-ctc（用户/账号）──鉴权──► z-task
z-wf（审批完成）──触发──► z-task（自动创建跟进任务）
z-schedule（定时调度）──提醒──► z-task（到期任务通知）
z-task（任务完成）──回调──► z-wf（更新审批状态）
```

## 1.4 服务端口

| 部署方式  | 端口   |
|-------|------|
| 独立运行  | 8090 |
| 主应用集成 | 8080 |

## 1.5 技术栈

| 组件           | 版本     |
|--------------|--------|
| Java         | 8      |
| Spring Boot  | 2.7.12 |
| MyBatis-Plus | 3.3.1  |
| MySQL        | 8.0    |

## 1.6 现有代码结构

**实体层（z-task-core）**：`Task`, `TaskList`, `Board`, `Project`, `ProjectMember`, `TaskAssignee`, `Label`, `TaskLabel`,
`SyncUser`

**Mapper 层**：`ProjectMapper`, `BoardMapper`, `TaskListMapper`, `TaskMapper`, `TaskAssigneeMapper`,
`ProjectMemberMapper`, `SyncUserMapper` —— 均已注册 MyBatis-Plus BaseMapper

**状态**：实体 + Mapper 骨架完整，**Web 层（Controller）尚未开发**，是当前最大的待建模块。

## 1.7 开发优先级

| 优先级 | 内容                                                             |
|-----|----------------------------------------------------------------|
| P0  | TaskController（任务 CRUD + 分页 + 看板视图）、ProjectController（项目 CRUD） |
| P1  | 任务指派多人、标签管理、与 z-wf 联动                                          |
| P2  | 甘特图、任务依赖、周期性任务（z-schedule 联动）                                  |
