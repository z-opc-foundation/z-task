-- =============================================================================
-- z-task 增量迁移脚本 (兼容 MySQL 5.7 / 8.0 旧版)
-- 不依赖 ADD COLUMN IF NOT EXISTS 语法 (MySQL 8.0.29+).
-- 业务方按需执行; 重复跑会报"列已存在"错误, 可忽略.
-- =============================================================================

-- 任务表 (拖拽 + 完成时间 + 看板)
ALTER TABLE `z_task_task`
    ADD COLUMN `list_id` BIGINT DEFAULT NULL COMMENT '当前列表ID (FK z_task_task_list.id)';
ALTER TABLE `z_task_task`
    ADD COLUMN `board_id` BIGINT DEFAULT NULL COMMENT '当前看板ID (FK z_task_board.id)';
ALTER TABLE `z_task_task`
    ADD COLUMN `position` VARCHAR(32) DEFAULT '0' COMMENT '拖拽排序位置';
ALTER TABLE `z_task_task`
    ADD COLUMN `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '任务完成时间';
ALTER TABLE `z_task_task`
    ADD INDEX `idx_list_id` (`list_id`);
ALTER TABLE `z_task_task`
    ADD INDEX `idx_board_id` (`board_id`);

-- 项目表加归档时间
ALTER TABLE `z_task_project`
    ADD COLUMN `archived_at` TIMESTAMP NULL DEFAULT NULL COMMENT '项目归档时间';
