-- Z-Task 数据库脚本
-- 基于 zb-ctc 的 SSO 集成，不单独管理用户登录

-- ============================================
-- 1. 用户同步表 (来自 zb-ctc)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_sync_user
(
    id
    BIGINT
    PRIMARY
    KEY,
    user_id
    VARCHAR
(
    64
) NOT NULL COMMENT 'zb-ctc 用户ID',
    username VARCHAR
(
    50
) NOT NULL COMMENT '用户名',
    nickname VARCHAR
(
    50
) COMMENT '昵称',
    email VARCHAR
(
    100
) COMMENT '邮箱',
    avatar VARCHAR
(
    255
) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1正常',
    source VARCHAR
(
    20
) DEFAULT 'zb-ctc' COMMENT '用户来源',
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后同步时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id
(
    user_id
),
    UNIQUE KEY uk_username
(
    username
),
    KEY idx_status
(
    status
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户同步表(来自zb-ctc)';

-- ============================================
-- 2. 项目表
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_project
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    name
    VARCHAR
(
    100
) NOT NULL COMMENT '项目名称',
    description TEXT COMMENT '项目描述',
    icon VARCHAR
(
    255
) COMMENT '项目图标',
    visibility TINYINT DEFAULT 0 COMMENT '可见性:0私有,1公开',
    owner_id VARCHAR
(
    64
) NOT NULL COMMENT '项目所有者(来自zb-ctc的用户ID)',
    status TINYINT DEFAULT 1 COMMENT '状态:0归档,1正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_owner_id
(
    owner_id
),
    KEY idx_status
(
    status
),
    KEY idx_created_at
(
    created_at
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- ============================================
-- 3. 项目成员表
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_project_member
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    project_id
    BIGINT
    NOT
    NULL
    COMMENT
    '项目ID',
    user_id
    VARCHAR
(
    64
) NOT NULL COMMENT '用户ID(来自zb-ctc)',
    role TINYINT DEFAULT 2 COMMENT '角色:0所有者,1管理员,2成员,3访客',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_user
(
    project_id,
    user_id
),
    KEY idx_project_id
(
    project_id
),
    KEY idx_user_id
(
    user_id
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表';

-- ============================================
-- 4. 看板表
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_board
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    name
    VARCHAR
(
    100
) NOT NULL COMMENT '看板名称',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    type TINYINT DEFAULT 0 COMMENT '看板类型:0标准,1时间线',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_project_id
(
    project_id
),
    KEY idx_sort_order
(
    sort_order
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='看板表';

-- ============================================
-- 5. 列表表 (看板中的列)
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_task_list
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    board_id
    BIGINT
    NOT
    NULL
    COMMENT
    '看板ID',
    name
    VARCHAR
(
    100
) NOT NULL COMMENT '列表名称',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_archived TINYINT DEFAULT 0 COMMENT '是否归档:0否,1是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_board_id
(
    board_id
),
    KEY idx_sort_order
(
    sort_order
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='列表表';

-- ============================================
-- 6. 任务表
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_task
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    title
    VARCHAR
(
    200
) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述(Markdown)',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    board_id BIGINT NOT NULL COMMENT '看板ID',
    list_id BIGINT NOT NULL COMMENT '当前列表ID',
    priority TINYINT DEFAULT 1 COMMENT '优先级:0低,1中,2高,3紧急',
    status TINYINT DEFAULT 0 COMMENT '状态:0待办,1进行中,2已完成',
    due_date DATE COMMENT '截止日期',
    creator_id VARCHAR
(
    64
) NOT NULL COMMENT '创建者ID(来自zb-ctc)',
    position VARCHAR
(
    50
) DEFAULT '0' COMMENT '排序位置(用于拖拽排序)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_project_id
(
    project_id
),
    KEY idx_board_id
(
    board_id
),
    KEY idx_list_id
(
    list_id
),
    KEY idx_creator_id
(
    creator_id
),
    KEY idx_status
(
    status
),
    KEY idx_due_date
(
    due_date
),
    KEY idx_position
(
    position
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- ============================================
-- 7. 任务执行者关联表
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_assignee
(
    task_id
    BIGINT
    NOT
    NULL
    COMMENT
    '任务ID',
    user_id
    VARCHAR
(
    64
) NOT NULL COMMENT '用户ID(来自zb-ctc)',
    PRIMARY KEY
(
    task_id,
    user_id
),
    KEY idx_user_id
(
    user_id
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务执行者关联表';

-- ============================================
-- 8. 标签表
-- ============================================
CREATE TABLE IF NOT EXISTS z_label
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    project_id
    BIGINT
    NOT
    NULL
    COMMENT
    '项目ID',
    name
    VARCHAR
(
    50
) NOT NULL COMMENT '标签名称',
    color VARCHAR
(
    10
) DEFAULT '#1890ff' COMMENT '标签颜色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_name
(
    project_id,
    name
),
    KEY idx_project_id
(
    project_id
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

-- ============================================
-- 9. 任务标签关联表
-- ============================================
CREATE TABLE IF NOT EXISTS z_task_label
(
    task_id
    BIGINT
    NOT
    NULL
    COMMENT
    '任务ID',
    label_id
    BIGINT
    NOT
    NULL
    COMMENT
    '标签ID',
    PRIMARY
    KEY
(
    task_id,
    label_id
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务标签关联表';

-- ============================================
-- 10. 检查清单表
-- ============================================
CREATE TABLE IF NOT EXISTS z_checklist
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    task_id
    BIGINT
    NOT
    NULL
    COMMENT
    '任务ID',
    content
    VARCHAR
(
    500
) NOT NULL COMMENT '内容',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id
(
    task_id
),
    KEY idx_sort_order
(
    sort_order
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查清单表';

-- ============================================
-- 11. 评论表
-- ============================================
CREATE TABLE IF NOT EXISTS z_comment
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    task_id
    BIGINT
    NOT
    NULL
    COMMENT
    '任务ID',
    user_id
    VARCHAR
(
    64
) NOT NULL COMMENT '用户ID(来自zb-ctc)',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT DEFAULT NULL COMMENT '父评论ID(回复)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_task_id
(
    task_id
),
    KEY idx_user_id
(
    user_id
),
    KEY idx_parent_id
(
    parent_id
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- ============================================
-- 12. 附件表
-- ============================================
CREATE TABLE IF NOT EXISTS z_attachment
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    task_id
    BIGINT
    NOT
    NULL
    COMMENT
    '任务ID',
    file_name
    VARCHAR
(
    255
) NOT NULL COMMENT '文件名',
    file_path VARCHAR
(
    500
) NOT NULL COMMENT '文件路径',
    file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
    mime_type VARCHAR
(
    100
) COMMENT '文件类型',
    uploader_id VARCHAR
(
    64
) NOT NULL COMMENT '上传者ID(来自zb-ctc)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id
(
    task_id
),
    KEY idx_uploader_id
(
    uploader_id
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件表';

-- ============================================
-- 13. 活动记录表
-- ============================================
CREATE TABLE IF NOT EXISTS z_activity
(
    id
    BIGINT
    PRIMARY
    KEY
    AUTO_INCREMENT,
    project_id
    BIGINT
    NOT
    NULL
    COMMENT
    '项目ID',
    task_id
    BIGINT
    COMMENT
    '任务ID(可选)',
    user_id
    VARCHAR
(
    64
) NOT NULL COMMENT '操作者ID(来自zb-ctc)',
    action VARCHAR
(
    50
) NOT NULL COMMENT '操作类型',
    target_type VARCHAR
(
    50
) COMMENT '目标类型',
    target_id BIGINT COMMENT '目标ID',
    old_value VARCHAR
(
    500
) COMMENT '旧值',
    new_value VARCHAR
(
    500
) COMMENT '新值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_project_id
(
    project_id
),
    KEY idx_task_id
(
    task_id
),
    KEY idx_user_id
(
    user_id
),
    KEY idx_created_at
(
    created_at
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动记录表';
