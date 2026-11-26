package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizModel;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 列表表 (看板中的列)
 *
 * @author zifang
 */
@BizModel(name = "列表表 (看板中的列)", module = "z-task", description = "列表表 (看板中的列)")
@TableName("z_task_task_list")
public class TaskList implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    @BizField(name = "主键ID", type = BizField.FieldType.INTEGER)
    private Long id;

    /**
     * 看板ID
     */
    @BizField(name = "看板ID", type = BizField.FieldType.INTEGER)
    private Long boardId;

    /**
     * 列表名称
     */
    @BizField(name = "列表名称", type = BizField.FieldType.STRING)
    private String name;

    /**
     * 排序
     */
    @BizField(name = "排序", type = BizField.FieldType.INTEGER)
    private Integer sortOrder;

    /**
     * 是否归档:0否,1是
     */
    @BizField(name = "是否归档:0否,1是", type = BizField.FieldType.INTEGER)
    private Integer isArchived;

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

    public Long getBoardId() {
        return boardId;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Integer getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Integer isArchived) {
        this.isArchived = isArchived;
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



