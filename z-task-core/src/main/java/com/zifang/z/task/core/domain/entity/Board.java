package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizModel;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 看板表
 *
 * @author zifang
 */
@BizModel(name = "看板表", module = "z-task", description = "看板表")
@TableName("z_task_board")
public class Board implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    @BizField(name = "主键ID", type = BizField.FieldType.INTEGER)
    private Long id;

    /**
     * 看板名称
     */
    @BizField(name = "看板名称", type = BizField.FieldType.STRING)
    private String name;

    /**
     * 项目ID
     */
    @BizField(name = "项目ID", type = BizField.FieldType.INTEGER)
    private Long projectId;

    /**
     * 看板类型:0标准,1时间线
     */
    @BizField(name = "看板类型:0标准,1时间线", type = BizField.FieldType.INTEGER)
    private Integer type;

    /**
     * 排序
     */
    @BizField(name = "排序", type = BizField.FieldType.INTEGER)
    private Long sortOrder;

    /**
     * 创建时间
     */
    @BizField(name = "创建时间", type = BizField.FieldType.DATETIME)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @BizField(name = "更新时间", type = BizField.FieldType.DATETIME)
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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Long getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Long sortOrder) {
        this.sortOrder = sortOrder;
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



