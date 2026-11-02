package com.zifang.z.task.admin.schema;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * 待办两表（{@code z_task_todo_project} / {@code z_task_todo_item}）的幂等建表。
 *
 * <p>与 z-task-core 的 {@code TodoProject} / {@code TodoItem} 实体（{@code @TableName}）
 * 及 {@code TodoAuditDO} 审计字段约定对齐（逻辑删除列为 {@code deleted}）。
 *
 * <p>⚠ **不挂在 {@code z.task.host.enabled} 开关下**：
 * {@code E2ESqlMigrationRunner} 是「寄生 all-in-one 模式」专用的（standalone 分布式模式
 * 由独立的数据库初始化流程负责）。但待办两表是 z-task 自己的业务表，standalone 部署
 * 也必须能跑起来 ⇒ 本 patcher 无条件执行，只受 {@code z-task.schema.auto-patch} 控制。
 *
 * <p>⚠ **列名与旧表逐字一致**（{@code z_team_todo_project} / {@code z_team_todo_item}），
 * 存量数据搬迁时可以直接 {@code INSERT ... SELECT}，无需列名映射。
 *
 * <p>2026-11-02 随待办能力迁入新增。
 *
 * @author z-task
 */
@Component
@Order(0)
public class TaskTodoSchemaPatcher implements ApplicationRunner {

    private static final Logger log = LogManager.getLogger(TaskTodoSchemaPatcher.class);

    @Resource
    private DataSource dataSource;

    @Value("${z-task.schema.auto-patch:true}")
    private boolean autoPatch;

    private static void createTableIfNotExists(Connection conn, String table, String ddl) throws Exception {
        if (tableExists(conn, table)) {
            return;
        }
        log.warn("table {} missing, creating", table);
        try (Statement st = conn.createStatement()) {
            st.execute(ddl);
        }
        log.info("table {} created", table);
    }

    private static boolean tableExists(Connection conn, String table) throws Exception {
        String schema = conn.getCatalog();
        if (schema == null || schema.isEmpty()) {
            schema = conn.getSchema();
        }
        String sql =
                "SELECT 1 FROM information_schema.TABLES "
                        + "WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? LIMIT 1";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, schema);
            ps.setString(2, table);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!autoPatch) {
            return;
        }
        try (Connection conn = dataSource.getConnection()) {
            createTableIfNotExists(conn, "z_task_todo_project",
                    "CREATE TABLE IF NOT EXISTS `z_task_todo_project` ("
                            + "  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',"
                            + "  `user_id`       VARCHAR(64)  NOT NULL COMMENT 'owner 用户ID（z-ctc userId）',"
                            + "  `title`         VARCHAR(128) NOT NULL COMMENT '项目名',"
                            + "  `icon`          VARCHAR(32)  NULL DEFAULT NULL COMMENT '图标（emoji）',"
                            + "  `description`   VARCHAR(512) NULL DEFAULT NULL COMMENT '项目描述',"
                            + "  `visibility`    VARCHAR(16)  NOT NULL DEFAULT 'private' COMMENT '可见性 private|shared',"
                            + "  `members`       JSON         NULL COMMENT '成员数组JSON [{userId,userName}]（不含owner，shared时生效）',"
                            + "  `sort_order`    INT          NOT NULL DEFAULT 0 COMMENT '同级排序',"
                            + "  `extra_info`    JSON         NULL COMMENT '项目空间扩展信息JSON（看板列配置等）',"
                            + "  `create_time`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',"
                            + "  `update_time`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',"
                            + "  `create_by`     VARCHAR(64) NULL DEFAULT NULL COMMENT '创建人ID',"
                            + "  `update_by`     VARCHAR(64) NULL DEFAULT NULL COMMENT '更新人ID',"
                            + "  `deleted`       TINYINT  NOT NULL DEFAULT 0 COMMENT '逻辑删除 0否 1是',"
                            + "  `create_by_name`  VARCHAR(64) NULL DEFAULT NULL COMMENT '创建人名称',"
                            + "  `update_by_name`  VARCHAR(64) NULL DEFAULT NULL COMMENT '更新人名称',"
                            + "  PRIMARY KEY (`id`),"
                            + "  KEY `idx_user` (`user_id`)"
                            + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待办-项目'");

            createTableIfNotExists(conn, "z_task_todo_item",
                    "CREATE TABLE IF NOT EXISTS `z_task_todo_item` ("
                            + "  `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',"
                            + "  `project_id`       BIGINT       NULL DEFAULT NULL COMMENT '所属项目id，NULL=收集箱',"
                            + "  `user_id`          VARCHAR(64)  NOT NULL COMMENT '创建人用户ID',"
                            + "  `title`            VARCHAR(256) NOT NULL COMMENT '事项标题',"
                            + "  `detail`           MEDIUMTEXT   NULL COMMENT 'markdown 详情',"
                            + "  `status`           VARCHAR(16)  NOT NULL DEFAULT 'TODO' COMMENT '状态 TODO|DOING|DONE|ARCHIVED',"
                            + "  `priority`         VARCHAR(8)   NOT NULL DEFAULT 'MEDIUM' COMMENT '优先级 HIGH|MEDIUM|LOW',"
                            + "  `due_date`         DATE         NULL DEFAULT NULL COMMENT '截止日期',"
                            + "  `assignee_user_id` VARCHAR(64)  NULL DEFAULT NULL COMMENT '指派人用户ID，NULL=未指派',"
                            + "  `tags`             JSON         NULL COMMENT '标签数组',"
                            + "  `links`            JSON         NULL COMMENT '关联 [{type:note|project|url,id,title}]',"
                            + "  `parent_id`        BIGINT       NOT NULL DEFAULT 0 COMMENT '父事项id，0=顶层（子事项）',"
                            + "  `sort_order`       INT          NOT NULL DEFAULT 0 COMMENT '同组排序',"
                            + "  `completed_at`     DATETIME     NULL DEFAULT NULL COMMENT '完成时间',"
                            + "  `completed_by`     VARCHAR(64)  NULL DEFAULT NULL COMMENT '完成人用户ID',"
                            + "  `agent_id`         BIGINT       NULL DEFAULT NULL COMMENT '派发目标个人Agent id（z-team 侧，跨仓软外键）',"
                            + "  `agent_session_id` BIGINT       NULL DEFAULT NULL COMMENT '对应单聊会话id（z-team 侧，跨仓软外键）',"
                            + "  `create_time`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',"
                            + "  `update_time`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',"
                            + "  `create_by`        VARCHAR(64) NULL DEFAULT NULL COMMENT '创建人ID',"
                            + "  `update_by`        VARCHAR(64) NULL DEFAULT NULL COMMENT '更新人ID',"
                            + "  `deleted`          TINYINT  NOT NULL DEFAULT 0 COMMENT '逻辑删除 0否 1是',"
                            + "  `create_by_name`   VARCHAR(64) NULL DEFAULT NULL COMMENT '创建人名称',"
                            + "  `update_by_name`   VARCHAR(64) NULL DEFAULT NULL COMMENT '更新人名称',"
                            + "  PRIMARY KEY (`id`),"
                            + "  KEY `idx_project_status` (`project_id`, `status`),"
                            + "  KEY `idx_assignee` (`assignee_user_id`, `status`),"
                            + "  KEY `idx_due` (`due_date`),"
                            + "  KEY `idx_parent` (`parent_id`),"
                            + "  KEY `idx_agent_session` (`agent_session_id`)"
                            + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待办-事项'");

            log.info("todo schema patch completed");
        } catch (Exception e) {
            log.error("failed to auto-patch todo tables — create z_task_todo_project/z_task_todo_item manually", e);
        }
    }
}
