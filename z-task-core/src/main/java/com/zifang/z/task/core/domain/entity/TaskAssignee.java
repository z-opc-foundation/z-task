package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizModel;

import java.io.Serializable;

/**
 * 任务执行者关联表
 *
 * @author zifang
 */
@BizModel(name = "任务执行者关联表", module = "z-task", description = "任务执行者关联表")
@TableName("z_task_task_assignee")
public class TaskAssignee implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 任务ID
     */
    @BizField(name = "任务ID", type = BizField.FieldType.INTEGER)
    private Long taskId;

    /**
     * 用户ID(来自zb-ctc)
     */
    @BizField(name = "用户ID(来自zb-ctc)", type = BizField.FieldType.STRING)
    private String userId;

    public TaskAssignee(Long taskId, String userId) {
        this.taskId = taskId;
        this.userId = userId;
    }

    public TaskAssignee() {
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}



