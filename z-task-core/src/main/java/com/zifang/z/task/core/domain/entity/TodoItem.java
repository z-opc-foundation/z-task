package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.task.core.domain.entity.base.TodoAuditDO;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 待办事项实体（表 {@code z_task_todo_item}）。
 *
 * <p>{@code projectId} 为 null 表示收集箱散件；{@code tags}/{@code links} 为 JSON 字符串，
 * 序列化在 Service 层完成；{@code parentId} 为 0 表示顶层事项。
 *
 * <p>projectId/dueDate/assigneeUserId/completedAt/completedBy 标注 {@code updateStrategy = IGNORED}：
 * 这些字段存在「清空」语义（移入收集箱、取消指派、重开事项），需允许 updateById 写入 NULL，
 * 否则默认 NOT_NULL 策略会静默丢弃置空操作。
 *
 * <p>2026-11-02 自 z-team 迁入（原表 {@code z_team_todo_item}）。
 *
 * <p>⚠ {@code agentId}/{@code agentSessionId} 是**跨仓软外键**：
 * 它们指向 z-team 的个人 Agent 与会话（{@code z_team_personal_agent.id} /
 * {@code z_team_personal_chat_session.id}）。待办归 z-task、Agent 归 z-team，
 * 两侧独立部署 ⇒ 这里**不建物理外键**，只保留 id 值，由 z-team 侧负责解释与校验。
 *
 * @author z-task
 */
@TableName("z_task_todo_item")
public class TodoItem extends TodoAuditDO {

    /**
     * 状态：待办
     */
    public static final String STATUS_TODO = "TODO";
    /**
     * 状态：进行中
     */
    public static final String STATUS_DOING = "DOING";
    /**
     * 状态：已完成
     */
    public static final String STATUS_DONE = "DONE";
    /**
     * 状态：已归档
     */
    public static final String STATUS_ARCHIVED = "ARCHIVED";
    /**
     * 优先级：高
     */
    public static final String PRIORITY_HIGH = "HIGH";
    /**
     * 优先级：中
     */
    public static final String PRIORITY_MEDIUM = "MEDIUM";
    /**
     * 优先级：低
     */
    public static final String PRIORITY_LOW = "LOW";

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     * <p>⚠ 显式 {@code IdType.AUTO}：沿用旧表的自增主键，保证存量 id 值域不变
     * （父类 {@code AuditDO} 默认是雪花 {@code ASSIGN_ID}）。
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 所属项目id，null=收集箱
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private Long projectId;

    /**
     * 创建人 z-ctc userId
     */
    private String userId;

    /**
     * 事项标题
     */
    private String title;

    /**
     * markdown 详情
     */
    private String detail;

    /**
     * 状态 TODO|DOING|DONE|ARCHIVED
     */
    private String status;

    /**
     * 优先级 HIGH|MEDIUM|LOW
     */
    private String priority;

    /**
     * 截止日期
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private LocalDate dueDate;

    /**
     * 指派人 z-ctc userId，null=未指派
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private String assigneeUserId;

    /**
     * 标签数组JSON
     */
    private String tags;

    /**
     * 关联JSON [{type:note|project|url,id,title}]
     */
    private String links;

    /**
     * 父事项id，0=顶层
     */
    private Long parentId;

    /**
     * 同组排序
     */
    private Integer sortOrder;

    /**
     * 完成时间
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private LocalDateTime completedAt;

    /**
     * 完成人 z-ctc userId
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private String completedBy;

    /**
     * 派发目标个人 Agent id（z-team 侧 {@code z_team_personal_agent.id}）；null=未派发。
     *
     * <p>语义：一条待办最多挂一个 Agent 会话（「一条待办 = 一个 Agent 开的一个对话」）。
     *
     * <p>⚠ **跨仓软外键**：Agent 与会话归 z-team，待办归 z-task，两侧独立部署 ⇒
     * 不建物理外键，只保留 id 值。写入由 z-team 侧通过 todo API 完成。
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private Long agentId;

    /**
     * 该待办对应的单聊会话 id（z-team 侧 {@code z_team_personal_chat_session.id}）；null=未派发。
     *
     * <p>非空即「已派发」，派发接口以此做幂等：重复点「交给 Agent」不会开出第二个会话。
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private Long agentSessionId;

    public TodoItem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public Long getAgentSessionId() {
        return agentSessionId;
    }

    public void setAgentSessionId(Long agentSessionId) {
        this.agentSessionId = agentSessionId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getAssigneeUserId() {
        return assigneeUserId;
    }

    public void setAssigneeUserId(String assigneeUserId) {
        this.assigneeUserId = assigneeUserId;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getLinks() {
        return links;
    }

    public void setLinks(String links) {
        this.links = links;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getCompletedBy() {
        return completedBy;
    }

    public void setCompletedBy(String completedBy) {
        this.completedBy = completedBy;
    }

    @Override
    public String toString() {
        return "TodoItem{id=" + getId() + ", projectId=" + getProjectId() + ", userId='" + getUserId()
                + "', title='" + getTitle() + "', status='" + getStatus() + "'}";
    }
}
