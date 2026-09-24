package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 任务表
 * <p>
 * 权威 schema 见 _doc/002_deploy/init/schema.sql (z_task_task)。
 *
 * @author zifang
 * @TableField mappings bridge the entity (new design) to the actual
 * DB columns (old design) without touching the DB.
 */
@TableName("z_task_task")
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 任务标题
     * <p>DB column is `name`.
     */
    @TableField("name")
    private String title;

    /**
     * 任务描述(Markdown)
     */
    private String description;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 看板ID（DB 无此列，旧 schema 用 board/list 走 z_task_task_list）
     */
    @TableField("board_id")
    private Long boardId;

    /**
     * 当前列表ID
     */
    @TableField("list_id")
    private Long listId;

    /**
     * 优先级:0低,1中,2高,3紧急
     */
    private Integer priority;

    /**
     * 状态:0待办,1进行中,2已完成
     */
    private Integer status;

    /**
     * 截止日期
     * <p>DB column is `deadline` (DATETIME, not DATE).
     */
    @TableField("deadline")
    private LocalDate dueDate;

    /**
     * 创建者ID(来自zb-ctc)
     * <p>DB column is `creator_id` (BIGINT, not VARCHAR).
     */
    @TableField("creator_id")
    private String creatorId;

    /**
     * 排序位置(用于拖拽排序)
     */
    @TableField("position")
    private String position;

    /**
     * 完成时间
     */
    @TableField("completed_at")
    private LocalDateTime completedAt;

    /**
     * 创建时间
     * <p>DB column is `gmt_create`.
     */
    @TableField(value = "gmt_create", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     * <p>DB column is `gmt_modified`.
     */
    @TableField(value = "gmt_modified", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getBoardId() {
        return boardId;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getListId() {
        return listId;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
