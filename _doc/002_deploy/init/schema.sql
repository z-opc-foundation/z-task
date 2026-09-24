-- =============================================================================
-- Z-Task 权威数据库 Schema (全新安装入口)
-- -----------------------------------------------------------------------------
-- 本文件与 z-task-core 实体类 (@TableName/@TableField) 一一对应, 是表结构的
-- 唯一权威来源。历史上 db.sql (z_project/z_task 旧命名) / schema.sql (新设计
-- 未落地列名) / migration.sql (增量) 三方漂移, 已收口:
--   * 全新安装 → 只跑本文件
--   * 存量库升级 → 跑 migration.sql (幂等性有限, 报"列已存在"可忽略)
-- 注意: Project/Task 实体通过 @TableField 桥接旧列名 (name/deadline/gmt_*),
-- 本 schema 直接按桥接后的真实列名建表, 新库无需桥接层也能跑。
-- =============================================================================

CREATE DATABASE IF NOT EXISTS z_task CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE z_task;

-- ============================================
-- 1. 用户同步表 (z_task_sync_user / SyncUser, 主键由外部 z-ctc userId 雪花值提供)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_sync_user
(
    id           BIGINT       PRIMARY KEY,
    user_id      VARCHAR(64)  NOT NULL COMMENT 'z-ctc 用户ID',
    username     VARCHAR(50)  NOT NULL COMMENT '用户名',
    nickname     VARCHAR(50)  COMMENT '昵称',
    email        VARCHAR(100) COMMENT '邮箱',
    avatar       VARCHAR(255) COMMENT '头像URL',
    status       TINYINT DEFAULT 1 COMMENT '状态:0禁用,1正常',
    source       VARCHAR(20) DEFAULT 'zb-ctc' COMMENT '用户来源',
    last_sync_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后同步时间',
    created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id),
    UNIQUE KEY uk_username (username),
    KEY idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='用户同步表(镜像 z-ctc)';

-- ============================================
-- 2. 项目表 (z_task_project / Project; 实体 ownerId 桥接列 manager_id)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_project
(
    id          BIGINT      PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL COMMENT '项目名称',
    description VARCHAR(500) COMMENT '项目描述',
    manager_id  VARCHAR(64) NOT NULL COMMENT '项目负责人ID (实体字段 ownerId)',
    status      TINYINT DEFAULT 1 COMMENT '状态:1进行中,2已完成,3已归档',
    archived_at TIMESTAMP NULL DEFAULT NULL COMMENT '归档时间',
    gmt_create  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    gmt_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    KEY idx_manager_id (manager_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='项目表';

-- ============================================
-- 3. 项目成员表 (z_task_project_member / ProjectMember)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_project_member
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT      NOT NULL COMMENT '项目ID',
    user_id    VARCHAR(64) NOT NULL COMMENT '用户ID (z-ctc)',
    role       TINYINT DEFAULT 2 COMMENT '角色:0所有者,1管理员,2成员,3访客',
    joined_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_user (project_id, user_id),
    KEY idx_project_id (project_id),
    KEY idx_user_id (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='项目成员表';

-- ============================================
-- 4. 看板表 (z_task_board / Board)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_board
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL COMMENT '看板名称',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    type       TINYINT DEFAULT 0 COMMENT '看板类型:0标准,1时间线',
    sort_order BIGINT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_project_id (project_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='看板表';

-- ============================================
-- 5. 任务列表表 (z_task_task_list / TaskList, 看板中的列)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_task_list
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    board_id    BIGINT NOT NULL COMMENT '看板ID',
    name        VARCHAR(100) NOT NULL COMMENT '列表名称',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_archived TINYINT DEFAULT 0 COMMENT '是否归档:0否,1是',
    created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_board_id (board_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='任务列表表(看板中的列)';

-- ============================================
-- 6. 任务表 (z_task_task / Task; 实体桥接: title→name, dueDate→deadline,
--    createdAt→gmt_create, updatedAt→gmt_modified)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_task
(
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(200) NOT NULL COMMENT '任务标题 (实体字段 title)',
    description  TEXT COMMENT '任务描述(Markdown)',
    project_id   BIGINT NOT NULL COMMENT '项目ID',
    board_id     BIGINT NULL DEFAULT NULL COMMENT '看板ID (FK z_task_board.id)',
    list_id      BIGINT NULL DEFAULT NULL COMMENT '当前列表ID (FK z_task_task_list.id)',
    priority     TINYINT DEFAULT 1 COMMENT '优先级:0低,1中,2高,3紧急',
    status       TINYINT DEFAULT 0 COMMENT '状态:0待办,1进行中,2已完成',
    deadline     DATE NULL DEFAULT NULL COMMENT '截止日期 (实体字段 dueDate)',
    creator_id   VARCHAR(64) NOT NULL COMMENT '创建者ID (z-ctc)',
    position     VARCHAR(32) DEFAULT '0' COMMENT '拖拽排序位置',
    completed_at TIMESTAMP NULL DEFAULT NULL COMMENT '任务完成时间',
    gmt_create   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    gmt_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    KEY idx_project_id (project_id),
    KEY idx_board_id (board_id),
    KEY idx_list_id (list_id),
    KEY idx_creator_id (creator_id),
    KEY idx_status (status),
    KEY idx_deadline (deadline),
    KEY idx_position (position)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='任务表';

-- ============================================
-- 7. 任务执行者关联表 (z_task_task_assignee / TaskAssignee, 复合主键无自增id)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_task_assignee
(
    task_id BIGINT      NOT NULL COMMENT '任务ID',
    user_id VARCHAR(64) NOT NULL COMMENT '执行者用户ID (z-ctc)',
    PRIMARY KEY (task_id, user_id),
    KEY idx_user_id (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='任务执行者关联表';

-- ============================================
-- 8. 标签表 (z_task_label / Label, 项目级标签定义)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_label
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name       VARCHAR(50) NOT NULL COMMENT '标签名称',
    color      VARCHAR(10) DEFAULT '#1890ff' COMMENT '标签颜色',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_name (project_id, name),
    KEY idx_project_id (project_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='标签表(项目级)';

-- ============================================
-- 9. 任务-标签关联表 (z_task_task_label / TaskLabel, 复合主键无自增id)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_task_label
(
    task_id  BIGINT NOT NULL COMMENT '任务ID',
    label_id BIGINT NOT NULL COMMENT '标签ID',
    PRIMARY KEY (task_id, label_id),
    KEY idx_label_id (label_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='任务-标签关联表';

-- =============================================================================
-- 预留表 (P1 功能规划, 当前代码无对应实体, 未启用; 建表无害但不会被打库代码触及)
-- =============================================================================
CREATE TABLE IF NOT EXISTS z_checklist
(
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id      BIGINT NOT NULL COMMENT '任务ID',
    content      VARCHAR(500) NOT NULL COMMENT '内容',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成',
    sort_order   INT DEFAULT 0 COMMENT '排序',
    created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='检查清单表(预留)';

CREATE TABLE IF NOT EXISTS z_comment
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id    BIGINT NOT NULL COMMENT '任务ID',
    user_id    VARCHAR(64) NOT NULL COMMENT '评论人ID (z-ctc)',
    content    TEXT NOT NULL COMMENT '评论内容',
    parent_id  BIGINT DEFAULT NULL COMMENT '父评论ID(回复)',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id),
    KEY idx_parent_id (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='评论表(预留)';

CREATE TABLE IF NOT EXISTS z_attachment
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id     BIGINT NOT NULL COMMENT '任务ID',
    file_name   VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path   VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size   BIGINT NOT NULL COMMENT '文件大小(字节)',
    mime_type   VARCHAR(100) COMMENT '文件类型',
    uploader_id VARCHAR(64) NOT NULL COMMENT '上传者ID (z-ctc)',
    created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='附件表(预留)';

CREATE TABLE IF NOT EXISTS z_activity
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id  BIGINT NOT NULL COMMENT '项目ID',
    task_id     BIGINT COMMENT '任务ID(可选)',
    user_id     VARCHAR(64) NOT NULL COMMENT '操作者ID (z-ctc)',
    action      VARCHAR(50) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '目标类型',
    target_id   BIGINT COMMENT '目标ID',
    old_value   VARCHAR(500) COMMENT '旧值',
    new_value   VARCHAR(500) COMMENT '新值',
    created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_project_id (project_id),
    KEY idx_task_id (task_id),
    KEY idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='活动记录表(预留)';
