-- 创建Z-Task数据库
CREATE
DATABASE IF NOT EXISTS z_task CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE
z_task;

-- 1. 项目表
DROP TABLE IF EXISTS `z_project`;
CREATE TABLE IF NOT EXISTS `z_project`
(
    `id`
    bigint
(
    20
) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` varchar
(
    100
) NOT NULL COMMENT '项目名称',
    `description` varchar
(
    500
) DEFAULT NULL COMMENT '项目描述',
    `manager_id` bigint
(
    20
) NOT NULL COMMENT '项目负责人ID',
    `status` tinyint
(
    1
) DEFAULT 1 COMMENT '状态：1=进行中，2=已完成，3=已归档',
    `start_time` datetime DEFAULT NULL COMMENT '开始时间',
    `end_time` datetime DEFAULT NULL COMMENT '结束时间',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted` tinyint
(
    1
) DEFAULT 0 COMMENT '是否删除：0=未删除，1=已删除',
    PRIMARY KEY
(
    `id`
),
    KEY `idx_manager_id`
(
    `manager_id`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 2. 任务表
DROP TABLE IF EXISTS `z_task`;
CREATE TABLE IF NOT EXISTS `z_task`
(
    `id`
    bigint
(
    20
) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` varchar
(
    200
) NOT NULL COMMENT '任务名称',
    `description` text DEFAULT NULL COMMENT '任务描述',
    `project_id` bigint
(
    20
) NOT NULL COMMENT '所属项目ID',
    `assignee_id` bigint
(
    20
) DEFAULT NULL COMMENT '负责人ID',
    `status` tinyint
(
    1
) DEFAULT 1 COMMENT '状态：1=待开始，2=进行中，3=已完成，4=已取消',
    `priority` tinyint
(
    1
) DEFAULT 2 COMMENT '优先级：1=低，2=中，3=高，4=紧急',
    `deadline` datetime DEFAULT NULL COMMENT '截止时间',
    `estimate_hours` int
(
    10
) DEFAULT NULL COMMENT '预计工时',
    `actual_hours` int
(
    10
) DEFAULT NULL COMMENT '实际工时',
    `parent_id` bigint
(
    20
) DEFAULT 0 COMMENT '父任务ID，0=顶级任务',
    `tags` varchar
(
    500
) DEFAULT NULL COMMENT '标签，多个用逗号分隔',
    `creator_id` bigint
(
    20
) NOT NULL COMMENT '创建人ID',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted` tinyint
(
    1
) DEFAULT 0 COMMENT '是否删除：0=未删除，1=已删除',
    PRIMARY KEY
(
    `id`
),
    KEY `idx_project_id`
(
    `project_id`
),
    KEY `idx_assignee_id`
(
    `assignee_id`
),
    KEY `idx_status`
(
    `status`
),
    KEY `idx_priority`
(
    `priority`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 3. 用户表
DROP TABLE IF EXISTS `z_user`;
CREATE TABLE IF NOT EXISTS `z_user`
(
    `id`
    bigint
(
    20
) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username` varchar
(
    50
) NOT NULL COMMENT '用户名',
    `password` varchar
(
    200
) NOT NULL COMMENT '密码（BCrypt加密）',
    `real_name` varchar
(
    50
) DEFAULT NULL COMMENT '真实姓名',
    `email` varchar
(
    100
) DEFAULT NULL COMMENT '邮箱',
    `phone` varchar
(
    20
) DEFAULT NULL COMMENT '手机号',
    `avatar` varchar
(
    500
) DEFAULT NULL COMMENT '头像URL',
    `status` tinyint
(
    1
) DEFAULT 1 COMMENT '状态：1=启用，0=禁用',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted` tinyint
(
    1
) DEFAULT 0 COMMENT '是否删除：0=未删除，1=已删除',
    PRIMARY KEY
(
    `id`
),
    UNIQUE KEY `uk_username`
(
    `username`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 4. 用户角色表
DROP TABLE IF EXISTS `z_user_role`;
CREATE TABLE IF NOT EXISTS `z_user_role`
(
    `id`
    bigint
(
    20
) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` bigint
(
    20
) NOT NULL COMMENT '用户ID',
    `role` varchar
(
    50
) NOT NULL COMMENT '角色：ROLE_ADMIN=管理员，ROLE_MANAGER=项目经理，ROLE_DEVELOPER=开发人员，ROLE_GUEST=访客',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY
(
    `id`
),
    UNIQUE KEY `uk_user_role`
(
    `user_id`,
    `role`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色表';

-- 5. 任务操作历史表
DROP TABLE IF EXISTS `z_task_history`;
CREATE TABLE IF NOT EXISTS `z_task_history`
(
    `id`
    bigint
(
    20
) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `task_id` bigint
(
    20
) NOT NULL COMMENT '任务ID',
    `operator_id` bigint
(
    20
) NOT NULL COMMENT '操作人ID',
    `operate_type` varchar
(
    50
) NOT NULL COMMENT '操作类型：CREATE=创建，UPDATE=修改，STATUS_CHANGE=状态变更，ASSIGN=分配，COMMENT=评论',
    `content` text DEFAULT NULL COMMENT '操作内容',
    `old_value` text DEFAULT NULL COMMENT '变更前值',
    `new_value` text DEFAULT NULL COMMENT '变更后值',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY
(
    `id`
),
    KEY `idx_task_id`
(
    `task_id`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务操作历史表';

-- 6. 任务评论表
DROP TABLE IF EXISTS `z_task_comment`;
CREATE TABLE IF NOT EXISTS `z_task_comment`
(
    `id`
    bigint
(
    20
) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `task_id` bigint
(
    20
) NOT NULL COMMENT '任务ID',
    `user_id` bigint
(
    20
) NOT NULL COMMENT '评论人ID',
    `content` text NOT NULL COMMENT '评论内容',
    `parent_id` bigint
(
    20
) DEFAULT 0 COMMENT '父评论ID，0=顶级评论',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` tinyint
(
    1
) DEFAULT 0 COMMENT '是否删除：0=未删除，1=已删除',
    PRIMARY KEY
(
    `id`
),
    KEY `idx_task_id`
(
    `task_id`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务评论表';

-- 初始化默认用户（用户名：admin，密码：admin，BCrypt加密后的值）
INSERT
IGNORE INTO `z_user` (`id`, `username`, `password`, `real_name`, `email`, `status`)
VALUES (1, 'admin', '$2a$10$EuWPZHzz32dJN7jexM34MOeYirDdFAZm2kuWj7VEOJhhZkDrxfvUu', '系统管理员', 'admin@example.com', 1);

-- 初始化默认角色（admin用户关联管理员角色）
INSERT
IGNORE INTO `z_user_role` (`user_id`, `role`)
VALUES (1, 'ROLE_ADMIN');

-- 初始化测试项目
INSERT
IGNORE INTO `z_project` (`id`, `name`, `description`, `manager_id`, `status`)
VALUES (1, 'Z-Task任务管理系统', '自研任务管理系统开发项目', 1, 1);

-- 初始化测试任务
INSERT
IGNORE INTO `z_task` (`id`, `name`, `description`, `project_id`, `assignee_id`, `status`, `priority`, `creator_id`)
VALUES
(1, '完成前端页面开发', '开发任务管理的前端页面，包括列表、详情、编辑等功能', 1, 1, 2, 3, 1),
(2, '开发后端API接口', '开发任务管理的后端RESTful API接口', 1, 1, 1, 3, 1);
