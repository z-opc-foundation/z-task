package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 项目表
 * <p>
 * 权威 schema 见 _doc/002_deploy/init/schema.sql (z_task_project)。
 * The @TableField mappings bridge the entity (new design) to the actual
 * DB columns (old design) without touching the DB.
 *
 * @author zifang
 */
@TableName("z_task_project")
public class Project implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 项目图标
     * <p>DB has no `icon` column — field is transient.
     */
    @TableField(exist = false)
    private String icon;

    /**
     * 可见性:0私有,1公开
     * <p>DB has no `visibility` column — field is transient.
     */
    @TableField(exist = false)
    private Integer visibility;

    /**
     * 项目所有者(来自zb-ctc的用户ID)
     * <p>DB column is `manager_id` (old schema).
     */
    @TableField("manager_id")
    private String ownerId;

    /**
     * 状态:0归档,1正常
     */
    private Integer status;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Integer getVisibility() {
        return visibility;
    }

    public void setVisibility(Integer visibility) {
        this.visibility = visibility;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
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
