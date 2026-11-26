package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizModel;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户同步表 (来自 zb-ctc)
 *
 * @author zifang
 */
@BizModel(name = "用户同步表 (来自 zb-ctc)", module = "z-task", description = "用户同步表 (来自 zb-ctc)")
@TableName("z_task_sync_user")
public class SyncUser implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.INPUT)
    @BizField(name = "主键ID", type = BizField.FieldType.INTEGER)
    private Long id;

    /**
     * zb-ctc 用户ID
     */
    @BizField(name = "zb-ctc 用户ID", type = BizField.FieldType.STRING)
    private String userId;

    /**
     * 用户名
     */
    @BizField(name = "用户名", type = BizField.FieldType.STRING)
    private String username;

    /**
     * 昵称
     */
    @BizField(name = "昵称", type = BizField.FieldType.STRING)
    private String nickname;

    /**
     * 邮箱
     */
    @BizField(name = "邮箱", type = BizField.FieldType.STRING)
    private String email;

    /**
     * 头像URL
     */
    @BizField(name = "头像URL", type = BizField.FieldType.STRING)
    private String avatar;

    /**
     * 状态:0禁用,1正常
     */
    @BizField(name = "状态:0禁用,1正常", type = BizField.FieldType.INTEGER)
    private Integer status;

    /**
     * 用户来源
     */
    @BizField(name = "用户来源", type = BizField.FieldType.STRING)
    private String source;

    /**
     * 最后同步时间
     */
    @BizField(name = "最后同步时间", type = BizField.FieldType.DATETIME)
    private LocalDateTime lastSyncAt;

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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getLastSyncAt() {
        return lastSyncAt;
    }

    public void setLastSyncAt(LocalDateTime lastSyncAt) {
        this.lastSyncAt = lastSyncAt;
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



