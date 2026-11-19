package com.zifang.z.task.core.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizModel;

import java.io.Serializable;

/**
 * 任务标签关联表
 *
 * @author zifang
 */
@BizModel(name = "任务标签关联表", module = "z-task", description = "任务标签关联表")
@TableName("z_task_task_label")
public class TaskLabel implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 任务ID
     */
    @BizField(name = "任务ID", type = BizField.FieldType.INTEGER)
    private Long taskId;

    /**
     * 标签ID
     */
    @BizField(name = "标签ID", type = BizField.FieldType.INTEGER)
    private Long labelId;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getLabelId() {
        return labelId;
    }

    public void setLabelId(Long labelId) {
        this.labelId = labelId;
    }
}



