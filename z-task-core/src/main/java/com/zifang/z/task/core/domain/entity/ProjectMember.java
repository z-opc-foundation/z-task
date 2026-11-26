package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizModel;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 项目成员表
 *
 * @author zifang
 */
@BizModel(name = "项目成员表", module = "z-task", description = "项目成员表")
@TableName("z_task_project_member")
public class ProjectMember implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    @BizField(name = "主键ID", type = BizField.FieldType.INTEGER)
    private Long id;

    /**
     * 项目ID
     */
    @BizField(name = "项目ID", type = BizField.FieldType.INTEGER)
    private Long projectId;

    /**
     * 用户ID(来自zb-ctc)
     */
    @BizField(name = "用户ID(来自zb-ctc)", type = BizField.FieldType.STRING)
    private String userId;

    /**
     * 角色:0所有者,1管理员,2成员,3访客
     */
    @BizField(name = "角色:0所有者,1管理员,2成员,3访客", type = BizField.FieldType.INTEGER)
    private Integer role;

    /**
     * 加入时间
     */
    @BizField(name = "加入时间", type = BizField.FieldType.DATETIME)
    private LocalDateTime joinedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getRole() {
        return role;
    }

    public void setRole(Integer role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}



