package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zifang.z.task.core.domain.entity.TaskLabel;
import com.zifang.z.task.core.domain.mapper.TaskLabelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 任务-标签关联 service.
 */
@Service
public class TaskLabelService extends ServiceImpl<TaskLabelMapper, TaskLabel> {

    public List<TaskLabel> listByTask(Long taskId) {
        if (taskId == null) return java.util.Collections.emptyList();
        return this.list(new LambdaQueryWrapper<TaskLabel>().eq(TaskLabel::getTaskId, taskId));
    }

    public List<TaskLabel> listByLabel(Long labelId) {
        if (labelId == null) return java.util.Collections.emptyList();
        return this.list(new LambdaQueryWrapper<TaskLabel>().eq(TaskLabel::getLabelId, labelId));
    }

    @Transactional
    public boolean attach(Long taskId, Long labelId) {
        if (taskId == null || labelId == null) return false;
        TaskLabel existed = this.getOne(new LambdaQueryWrapper<TaskLabel>()
                .eq(TaskLabel::getTaskId, taskId)
                .eq(TaskLabel::getLabelId, labelId)
                .last("LIMIT 1"));
        if (existed != null) return true;
        TaskLabel entity = new TaskLabel();
        entity.setTaskId(taskId);
        entity.setLabelId(labelId);
        return this.save(entity);
    }

    @Transactional
    public boolean detach(Long taskId, Long labelId) {
        if (taskId == null || labelId == null) return false;
        return this.remove(new LambdaQueryWrapper<TaskLabel>()
                .eq(TaskLabel::getTaskId, taskId)
                .eq(TaskLabel::getLabelId, labelId));
    }
}
