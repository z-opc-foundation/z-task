# Z-Task 架构设计文档

## 1. 总体架构

采用经典的分层架构，前后端分离：

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                      │
│                   Vue 3 + Element Plus + Pinia                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS/WebSocket
┌──────────────────────────────▼──────────────────────────────┐
│                       网关/负载均衡 (Nginx)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      后端服务层 (Backend)                     │
│              Spring Boot 2.7.12 + Java 8                      │
├─────────────────────────────────────────────────────────────┤
│  Controller层  │  Service层  │  Mapper层  │  Entity层       │
│  (REST API)   │  (业务逻辑)  │  (数据访问) │  (实体定义)      │
└─────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                     数据存储层 (Storage)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   MySQL 8   │  │  Redis(可选) │  │    文件存储(附件)    │  │
│  │  (主数据库)  │  │   (缓存)    │  │   (本地/OSS)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 2. 模块划分

### 2.1 后端模块 (Maven 多模块)

```
z-task/
├── z-task-admin/          # Web服务入口，Controller层
├── z-task-service/        # 业务逻辑层
├── z-task-mapper/         # 数据访问层
├── z-task-entity/         # 实体/Domain对象
├── z-task-common/         # 公共工具类、常量、异常
└── pom.xml                # 父POM
```

#### 各模块职责

| 模块               | 职责                   | 依赖              |
|------------------|----------------------|-----------------|
| `z-task-admin`   | REST API接口、参数校验、异常处理 | service, common |
| `z-task-service` | 业务逻辑、事务管理、权限检查       | mapper, common  |
| `z-task-mapper`  | 数据访问、SQL映射           | entity, common  |
| `z-task-entity`  | Entity、DTO、VO、枚举     | 无(或common)      |
| `z-task-common`  | 常量、工具类、异常定义、通用配置     | 无               |

### 2.2 前端模块

```
z-task-ui/
├── src/
│   ├── api/                 # 接口请求封装
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件
│   ├── views/               # 页面视图
│   │   ├── login/           # 登录注册
│   │   ├── project/         # 项目管理
│   │   ├── board/           # 看板
│   │   ├── task/            # 任务详情
│   │   └── user/            # 个人中心
│   ├── router/              # 路由配置
│   ├── store/               # Pinia状态管理
│   ├── utils/               # 工具函数
│   └── App.vue
├── package.json
└── vite.config.js
```

## 3. 数据库设计

### 3.1 实体关系图 (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    user      │       │  user_project │       │   project    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄─────►│ user_id (FK)  │       │ id (PK)      │
│ username     │       │ project_id(FK)◄────►│ name         │
│ email        │       │ role          │       │ description  │
│ password     │       │ joined_at     │       │ visibility   │
│ avatar       │       └──────────────┘       │ owner_id(FK) │
│ status       │                              │ created_at   │
│ created_at   │                              └──────┬───────┘
└──────────────┘                                     │
                                                     │
┌──────────────┐       ┌──────────────┐              │
│    label     │       │  task_label  │              │
├──────────────┤       ├──────────────┤              │
│ id (PK)      │◄─────►│ label_id(FK) │              │
│ name         │       │ task_id (FK) │              │
│ color        │       └──────────────┘              │
│ project_id(FK)◄─────┘                             │
└──────────────┘                                     │
                                                     ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   comment    │       │  checklist   │       │     task     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ content      │       │ content      │       │ title        │
│ task_id(FK)  │◄─────│ task_id(FK)  │◄─────│ description  │
│ user_id(FK)  │       │ is_completed │       │ priority     │
│ created_at   │       │ sort_order   │       │ status       │
└──────────────┘       └──────────────┘       │ due_date     │
                                              │ board_id(FK) │
┌──────────────┐       ┌──────────────┐       │ list_id(FK)  │
│   board      │       │    list      │       │ assignee_id  │
├──────────────┤       ├──────────────┤       │ position     │
│ id (PK)      │◄─────│ board_id(FK) │◄─────│ creator_id   │
│ name         │       │ id (PK)      │       │ sort_order   │
│ project_id(FK)◄────►│ name         │       │ created_at   │
│ type         │       │ sort_order   │       │ updated_at   │
│ created_at   │       │ is_archive   │       └──────────────┘
└──────────────┘       └──────────────┘

┌──────────────┐
│ task_assignee│
├──────────────┤
│ task_id(FK)  │
│ user_id(FK)  │
└──────────────┘
```

### 3.2 核心表结构

#### 用户表 (z_user)

```sql
CREATE TABLE z_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_username (username)
) COMMENT '用户表';
```

#### 项目表 (z_project)

```sql
CREATE TABLE z_project (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '项目名称',
    description TEXT COMMENT '项目描述',
    icon VARCHAR(255) COMMENT '项目图标',
    visibility TINYINT DEFAULT 0 COMMENT '可见性:0私有,1公开',
    owner_id BIGINT NOT NULL COMMENT '项目所有者',
    status TINYINT DEFAULT 1 COMMENT '状态:0归档,1正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_owner_id (owner_id),
    KEY idx_status (status)
) COMMENT '项目表';
```

#### 项目成员表 (z_project_member)

```sql
CREATE TABLE z_project_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role TINYINT DEFAULT 2 COMMENT '角色:0所有者,1管理员,2成员,3访客',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_user (project_id, user_id),
    KEY idx_project_id (project_id),
    KEY idx_user_id (user_id)
) COMMENT '项目成员表';
```

#### 看板表 (z_board)

```sql
CREATE TABLE z_board (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '看板名称',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    type TINYINT DEFAULT 0 COMMENT '看板类型:0标准,1时间线',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_project_id (project_id),
    KEY idx_sort_order (sort_order)
) COMMENT '看板表';
```

#### 列表表 (z_task_list)

```sql
CREATE TABLE z_task_list (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    board_id BIGINT NOT NULL COMMENT '看板ID',
    name VARCHAR(100) NOT NULL COMMENT '列表名称',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_archived TINYINT DEFAULT 0 COMMENT '是否归档:0否,1是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_board_id (board_id),
    KEY idx_sort_order (sort_order)
) COMMENT '列表表';
```

#### 任务表 (z_task)

```sql
CREATE TABLE z_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述(Markdown)',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    board_id BIGINT NOT NULL COMMENT '看板ID',
    list_id BIGINT NOT NULL COMMENT '当前列表ID',
    priority TINYINT DEFAULT 1 COMMENT '优先级:0低,1中,2高,3紧急',
    status TINYINT DEFAULT 0 COMMENT '状态:0待办,1进行中,2已完成',
    due_date DATE COMMENT '截止日期',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    position VARCHAR(50) DEFAULT '0' COMMENT '排序位置(用于拖拽排序)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_project_id (project_id),
    KEY idx_board_id (board_id),
    KEY idx_list_id (list_id),
    KEY idx_creator_id (creator_id),
    KEY idx_assignee_id (status),
    KEY idx_due_date (due_date)
) COMMENT '任务表';
```

#### 任务执行者关联表 (z_task_assignee)

```sql
CREATE TABLE z_task_assignee (
    task_id BIGINT NOT NULL COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    PRIMARY KEY (task_id, user_id),
    KEY idx_user_id (user_id)
) COMMENT '任务执行者关联表';
```

#### 标签表 (z_label)

```sql
CREATE TABLE z_label (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(10) DEFAULT '#1890ff' COMMENT '标签颜色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_name (project_id, name),
    KEY idx_project_id (project_id)
) COMMENT '标签表';
```

#### 任务标签关联表 (z_task_label)

```sql
CREATE TABLE z_task_label (
    task_id BIGINT NOT NULL COMMENT '任务ID',
    label_id BIGINT NOT NULL COMMENT '标签ID',
    PRIMARY KEY (task_id, label_id)
) COMMENT '任务标签关联表';
```

#### 检查清单表 (z_checklist)

```sql
CREATE TABLE z_checklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    content VARCHAR(500) NOT NULL COMMENT '内容',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id),
    KEY idx_sort_order (sort_order)
) COMMENT '检查清单表';
```

#### 评论表 (z_comment)

```sql
CREATE TABLE z_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT DEFAULT NULL COMMENT '父评论ID(回复)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id),
    KEY idx_user_id (user_id),
    KEY idx_parent_id (parent_id)
) COMMENT '评论表';
```

#### 附件表 (z_attachment)

```sql
CREATE TABLE z_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
    mime_type VARCHAR(100) COMMENT '文件类型',
    uploader_id BIGINT NOT NULL COMMENT '上传者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id),
    KEY idx_uploader_id (uploader_id)
) COMMENT '附件表';
```

#### 活动记录表 (z_activity)

```sql
CREATE TABLE z_activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    task_id BIGINT COMMENT '任务ID(可选)',
    user_id BIGINT NOT NULL COMMENT '操作者ID',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '目标类型',
    target_id BIGINT COMMENT '目标ID',
    old_value VARCHAR(500) COMMENT '旧值',
    new_value VARCHAR(500) COMMENT '新值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_project_id (project_id),
    KEY idx_task_id (task_id),
    KEY idx_user_id (user_id),
    KEY idx_created_at (created_at)
) COMMENT '活动记录表';
```

## 3. API 设计规范

### 3.1 RESTful API 规范

```
基础路径: /api/v1

资源命名:
  GET    /projects              # 列表
  POST   /projects              # 创建
  GET    /projects/{id}         # 详情
  PUT    /projects/{id}         # 更新
  DELETE /projects/{id}         # 删除
  
嵌套资源:
  GET    /projects/{id}/tasks   # 项目下的任务
  GET    /projects/{id}/members # 项目成员

通用响应格式:
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

### 3.2 主要接口列表

| 接口     | 方法     | 路径                              | 说明     |
|--------|--------|---------------------------------|--------|
| 用户注册   | POST   | /auth/register                  |        |
| 用户登录   | POST   | /auth/login                     | 返回JWT  |
| 获取当前用户 | GET    | /auth/user                      |        |
| 项目列表   | GET    | /projects                       | 支持分页搜索 |
| 创建项目   | POST   | /projects                       |        |
| 项目详情   | GET    | /projects/{id}                  |        |
| 更新项目   | PUT    | /projects/{id}                  |        |
| 删除项目   | DELETE | /projects/{id}                  |        |
| 项目成员   | GET    | /projects/{id}/members          |        |
| 邀请成员   | POST   | /projects/{id}/members          |        |
| 移除成员   | DELETE | /projects/{id}/members/{userId} |        |
| 看板列表   | GET    | /projects/{id}/boards           |        |
| 创建看板   | POST   | /boards                         |        |
| 列表操作   | CRUD   | /lists                          |        |
| 任务列表   | GET    | /projects/{id}/tasks            | 支持筛选   |
| 创建任务   | POST   | /tasks                          |        |
| 任务详情   | GET    | /tasks/{id}                     |        |
| 更新任务   | PUT    | /tasks/{id}                     |        |
| 删除任务   | DELETE | /tasks/{id}                     |        |
| 拖拽排序   | PUT    | /tasks/{id}/move                |        |
| 标签管理   | CRUD   | /projects/{id}/labels           |        |
| 检查清单   | CRUD   | /tasks/{id}/checklist           |        |
| 评论     | CRUD   | /tasks/{id}/comments            |        |
| 附件上传   | POST   | /tasks/{id}/attachments         |        |
| 附件删除   | DELETE | /attachments/{id}               |        |
| 活动记录   | GET    | /projects/{id}/activities       |        |
| 我的任务   | GET    | /users/me/tasks                 | 聚合所有任务 |

## 4. 核心业务流程

### 4.1 用户注册/登录流程

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  用户   │────►│  注册/登录  │────►│  校验密码   │────►│  生成JWT  │
└─────────┘     └─────────────┘     └─────────────┘     └──────────┘
                                                              │
                                                              ▼
┌──────────┐    ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  前端存储 │◄───│   后续请求   │◄────│  验证JWT    │◄────│ 返回Token │
│  (local) │    │  (Header)   │     │   过滤器    │     │           │
└──────────┘    └─────────────┘     └─────────────┘     └──────────┘
```

### 4.2 创建任务流程

```
┌──────────┐
│  用户输入 │
│ 任务信息 │
└────┬─────┘
     │
     ▼
┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  1. 验证权限      │───►│ 2. 校验项目/看板  │───►│ 3. 保存任务数据   │
│  (项目成员?)     │    │    是否存在      │    │                │
└──────────────────┘    └─────────────────┘    └───────┬──────────┘
                                                       │
                                                       ▼
┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ 6. 返回任务详情   │◄───│ 5. 记录活动日志  │◄───│ 4. 更新看板排序   │
│                  │    │  (创建任务)      │    │                │
└──────────────────┘    └─────────────────┘    └──────────────────┘
```

### 4.3 拖拽排序流程

```
┌────────────┐
│  前端拖拽   │
│  卡片移动   │
└─────┬──────┘
      │
      ▼
┌──────────────────────────────────────┐
│  请求: PUT /tasks/{id}/move            │
│  body: {                               │
│    targetListId: 目标列表ID,           │
│    position: 排序位置(如0.5, 1.5)      │
│  }                                     │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  1. 验证权限      │───►│ 2. 验证任务存在  │───►│ 3. 检查目标列表  │
│  (项目成员?)     │    │                 │    │   是否存在       │
└──────────────────┘    └─────────────────┘    └────────┬─────────┘
                                                        │
                                                        ▼
┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ 6. 记录活动日志   │◄───│ 5. 更新任务位置  │◄───│ 4. 计算新position │
│  (移动任务)      │    │                 │    │  (防止重复)      │
└──────────────────┘    └─────────────────┘    └──────────────────┘
```

## 5. 技术实现要点

### 5.1 拖拽排序算法

采用字符串排序法（类似Fractional Indexing），避免大规模更新：

```
列表1: 任务A(position=0), 任务B(position=1)

在A和B之间插入任务C:
  C.position = (A.position + B.position) / 2 = 0.5
  
结果: A(0), C(0.5), B(1)

如果需要更高精度，使用字符串:
  A.position = "a", B.position = "b"
  C.position = "a" + ("b" - "a")/2 = "am"
```

### 5.2 WebSocket 实时通知

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   用户A      │◄────►│   WebSocket   │◄────►│   后端服务   │
│  (操作任务)   │      │    Server     │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
                                                      │
                            ┌─────────────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   用户B      │
                     │  (收到通知)   │
                     └──────────────┘

消息格式:
{
  "type": "TASK_UPDATED",
  "projectId": 1,
  "taskId": 123,
  "data": { ... },
  "operator": { id: 1, name: "张三" }
}
```

### 5.3 权限控制设计

```java
@PermissionCheck(type = PermissionType.PROJECT, action = "WRITE")
@PostMapping("/projects/{projectId}/tasks")
public Result<TaskVO> createTask(
    @PathVariable Long projectId,
    @RequestBody TaskCreateDTO dto
) {
    // 创建任务
}

// 权限级别
enum ProjectRole {
    OWNER(0),    // 所有者 - 所有权限
    ADMIN(1),    // 管理员 - 除删除项目外所有权限
    MEMBER(2),   // 成员 - 创建/编辑任务、评论
    GUEST(3)     // 访客 - 只读
}
```

## 6. SSO 集成方案

Z-Task 集成 `zb-ctc` 的 SSO 认证能力，实现统一身份认证。

### 6.1 集成架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Z-Task 项目                                  │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐    │
│  │   z-task-admin   │◄──►│  ctc-sso依赖   │◄──►│  zb-ctc    │    │
│  │  (SSO Interceptor│    │  (Token验证)   │    │  SSO服务   │    │
│  │   SsoContext)    │    │                │    │            │    │
│  └──────────────────┘    └──────────────────┘    └──────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

登录流程:
1. 用户访问 Z-Task
2. SsoInterceptor 检查 Cookie 中的 token
3. 如果无效，重定向到 zb-ctc 登录页
4. 登录成功后，携带 token 返回 Z-Task
5. 后续请求通过 SsoContext 获取当前用户
```

### 6.2 依赖配置

```xml
<!-- z-task/pom.xml -->
<dependency>
    <groupId>com.zifang</groupId>
    <artifactId>ctc-sso</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### 6.3 配置文件

```yaml
# application.yml
sso:
  # zb-ctc 登录页地址
  login-url: http://localhost:8080/ctc/login
  # Token Cookie 名称
  token-cookie-name: ctc_token
  # 拦截路径
  intercept-paths:
    - /**
  # 排除路径
  exclude-paths:
    - /api/v1/public/**
    - /swagger-ui/**
    - /v3/api-docs/**
  # Token 验证服务地址 (使用远程验证)
  auth-server-url: http://localhost:8080/ctc/api/auth/verify
```

### 6.4 使用方式

```java
// 1. 在 Controller 中获取当前用户
@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    @GetMapping
    public Result<List<ProjectVO>> list() {
        // 从 SSO Context 获取当前用户
        UserInfo currentUser = SsoContext.getCurrentUser();
        if (currentUser == null) {
            return Result.fail("未登录");
        }
        
        String userId = currentUser.getUserId();
        // 查询该用户的项目列表...
    }
}

// 2. 在 Service 层检查权限
@Service
public class ProjectService {
    
    public void createProject(ProjectDTO dto) {
        UserInfo user = SsoContext.getCurrentUser();
        if (user == null) {
            throw new AuthException("未登录");
        }
        
        // 检查用户是否有创建项目的权限
        if (!user.getPermissions().contains("project:create")) {
            throw new ForbiddenException("无权限创建项目");
        }
        
        // 创建项目...
    }
}

// 3. 获取用户角色进行项目权限判断
public boolean hasProjectPermission(Long projectId, String action) {
    UserInfo user = SsoContext.getCurrentUser();
    if (user == null) return false;
    
    // 超级管理员
    if (user.getRoles().contains("SUPER_ADMIN")) {
        return true;
    }
    
    // 查询用户在项目中的角色
    ProjectMember member = projectMemberMapper.selectByProjectAndUser(projectId, user.getUserId());
    if (member == null) return false;
    
    // 根据角色判断权限
    ProjectRole role = ProjectRole.valueOf(member.getRole());
    return role.hasPermission(action);
}
```

### 6.5 用户同步方案

```
┌────────────────────────────────────────────────────────────────┐
│                         zb-ctc                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   用户管理模块   │──────────────│   用户数据表     │        │
│  │   (增删改查)     │              │   (z_user)       │        │
│  └──────────────────┘              └──────────┬───────┘        │
│                                              │                │
│                              用户数据变更事件 (MQ/回调)        │
│                                              │                │
└──────────────────────────────────────────────┼────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────┼────────────────┐
│                         z-task                 │                │
│                                              │                │
│  ┌──────────────────┐              ┌─────────▼───────┐        │
│  │  用户同步服务    │◄─────────────│  监听用户变更   │        │
│  │  (写入本地缓存)  │              │  (或定时同步)   │        │
│  └──────────────────┘              └─────────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**用户表结构设计（Z-Task 本地缓存）:**

```sql
-- 同步自 zb-ctc 的用户信息
CREATE TABLE z_sync_user (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT 'zb-ctc 用户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    nickname VARCHAR(50) COMMENT '昵称',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1正常',
    source VARCHAR(20) DEFAULT 'zb-ctc' COMMENT '用户来源',
    last_sync_at TIMESTAMP COMMENT '最后同步时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id),
    UNIQUE KEY uk_username (username),
    KEY idx_status (status)
) COMMENT '用户同步表(来自zb-ctc)';
```

这样 Z-Task 项目就不需要自己实现登录注册功能，完全复用 `zb-ctc` 的 SSO 能力，只需要同步用户数据即可。

---

**更新完成**：已在 `doc/架构设计.md` 中新增了第 6 节 **SSO 集成方案**，详细说明了：

1. 集成架构图
2. 依赖配置
3. 配置文件
4. 使用方式（代码示例）
5. 用户同步方案（含表结构）

等你确认后，我可以开始 Phase 1 的开发工作。我已经了解了 `zb-ctc` 的 SSO 能力，这是一个基于 JWT Token + Cookie
的单点登录方案，包含：<|tool_calls_section_begin|><|tool_call_begin|>functions.Read:16<|tool_call_argument_begin|>{

## 6. 项目结构

```
z-task/
├── z-task-admin/              # Web服务入口
│   ├── src/main/
│   │   ├── java/com/zifang/z/task/admin/
│   │   │   ├── controller/    # REST API
│   │   │   ├── config/        # 配置类
│   │   │   └── ZTaskApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── log4j2.xml
│   └── pom.xml
│
├── z-task-service/              # 业务逻辑层
│   └── src/main/java/com/zifang/z/task/service/
│       ├── impl/                # 实现类
│       ├── UserService.java
│       ├── ProjectService.java
│       ├── BoardService.java
│       ├── TaskService.java
│       └── ...
│
├── z-task-mapper/               # 数据访问层
│   └── src/main/java/com/zifang/z/task/mapper/
│       ├── xml/                 # Mapper XML
│       ├── UserMapper.java
│       ├── ProjectMapper.java
│       └── ...
│
├── z-task-entity/               # 实体层
│   └── src/main/java/com/zifang/z/task/entity/
│       ├── dto/                 # 传输对象
│       ├── vo/                  # 视图对象
│       ├── param/               # 参数对象
│       ├── User.java
│       ├── Project.java
│       └── ...
│
├── z-task-common/               # 公共模块
│   └── src/main/java/com/zifang/z/task/common/
│       ├── constant/            # 常量
│       ├── exception/           # 异常
│       ├── util/                # 工具类
│       └── result/              # 统一响应
│
├── doc/                         # 文档
│   ├── feature.md
│   └── 架构设计.md
│
├── db/                          # 数据库脚本
│   ├── z-ctc.sql               # 建表脚本
│   └── init-data.sql            # 初始数据
│
├── pom.xml                      # 父POM
└── README.md
```

## 7. 开发计划

### Phase 1: 基础框架 (P0)

- [ ] 项目初始化，搭建Maven多模块结构
- [ ] 配置Spring Boot、MyBatis Plus、Druid
- [ ] 数据库建表
- [ ] 统一异常处理、统一响应格式
- [ ] JWT认证过滤器

### Phase 2: 用户与项目 (P0)

- [ ] 用户注册/登录/登出
- [ ] 获取当前用户信息
- [ ] 项目CRUD
- [ ] 项目成员管理

### Phase 3: 看板与任务 (P0)

- [ ] 看板CRUD
- [ ] 列表CRUD
- [ ] 任务CRUD
- [ ] 拖拽排序

### Phase 4: 任务详情 (P1)

- [ ] 标签管理
- [ ] 检查清单
- [ ] 评论
- [ ] 附件上传
- [ ] 活动记录

### Phase 5: 增强功能 (P1-P2)

- [ ] 多视图(列表、日历)
- [ ] 我的任务聚合
- [ ] 实时通知(WebSocket)
- [ ] 全文搜索
- [ ] 邮件通知

---

**文档完成时间**: 2026/04/05  
**下一步**: 等待确认后进入开发阶段
