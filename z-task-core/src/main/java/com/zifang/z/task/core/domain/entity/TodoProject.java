package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.task.core.domain.entity.base.TodoAuditDO;

/**
 * 待办项目实体（表 {@code z_task_todo_project}）。
 *
 * <p>项目是待办事项的组织容器：默认私有（仅 owner），可转共享（owner + members 可见可编辑）。
 * {@code members} 为成员 z-ctc userId 数组的 JSON 字符串（不含 owner），序列化在 Service 层完成。
 *
 * <p>{@code extraInfo} 为项目空间扩展信息 JSON，当前承载看板列配置
 * {@code {"statusColumns":[{status,label}]}}：列与状态 1:1 绑定，状态含内置
 * TODO/DOING/DONE/ARCHIVED 与项目自定义（C_ 前缀）两类。
 *
 * <p>2026-11-02 自 z-team 迁入（原表 {@code z_team_todo_project}）。
 * 迁移动机：待办能力归属 z-task —— z-task 已迁 Spring Boot 3 / Java 17，
 * 而 z-team 与主壳仍在 Spring Boot 2 / Java 8，两侧无法共享 jar（lead 003 原则 21：
 * 跨板块只走 HTTP、零 jar 边界）。
 *
 * <p>⚠ 列名与 id 值域**逐字保留**旧表：存量数据搬迁后父子引用、Agent 会话关联全部继续有效。
 *
 * @author z-task
 */
@TableName("z_task_todo_project")
public class TodoProject extends TodoAuditDO {

    /**
     * 可见性：私有
     */
    public static final String VISIBILITY_PRIVATE = "private";
    /**
     * 可见性：共享（owner + members）
     */
    public static final String VISIBILITY_SHARED = "shared";

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     * <p>⚠ 显式 {@code IdType.AUTO}：沿用旧表的自增主键，保证存量 id 值域不变
     * （父类 {@code AuditDO} 默认是雪花 {@code ASSIGN_ID}）。
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * owner z-ctc userId
     */
    private String userId;

    /**
     * 项目名
     */
    private String title;

    /**
     * 图标（emoji）
     */
    private String icon;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 可见性 private|shared
     */
    private String visibility;

    /**
     * 成员 userId 数组 JSON（不含 owner）
     */
    private String members;

    /**
     * 同级排序
     */
    private Integer sortOrder;

    /**
     * 项目空间扩展信息 JSON（看板列配置等）。
     *
     * <p>{@code updateStrategy = IGNORED} 不能去掉：MyBatis-Plus 默认在 update 时
     * 跳过 null 字段，那样 {@code extraInfo=null} 就<b>清不掉</b>已有配置 ——
     * 用户「恢复默认列」会静默无效。IGNORED 让显式传的 null 也能落库。
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private String extraInfo;

    public TodoProject() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getMembers() {
        return members;
    }

    public void setMembers(String members) {
        this.members = members;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getExtraInfo() {
        return extraInfo;
    }

    public void setExtraInfo(String extraInfo) {
        this.extraInfo = extraInfo;
    }

    @Override
    public String toString() {
        return "TodoProject{id=" + getId() + ", userId='" + getUserId() + "', title='" + getTitle()
                + "', visibility='" + getVisibility() + "'}";
    }
}
