package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zifang.z.task.core.domain.entity.Label;
import com.zifang.z.task.core.domain.mapper.LabelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 标签 service.
 * <p>
 * 标签归属项目 (projectId), 用于任务分类.
 */
@Service
public class LabelService extends ServiceImpl<LabelMapper, Label> {

    public List<Label> listByProject(Long projectId) {
        if (projectId == null) return java.util.Collections.emptyList();
        return this.list(new LambdaQueryWrapper<Label>()
                .eq(Label::getProjectId, projectId)
                .orderByAsc(Label::getId));
    }

    @Transactional
    public Label createLabel(Label label) {
        if (label == null) throw new IllegalArgumentException("label must not be null");
        if (label.getProjectId() == null) throw new IllegalArgumentException("projectId 必填");
        if (label.getName() == null || label.getName().isEmpty()) throw new IllegalArgumentException("name 必填");
        // 同名幂等
        Label existed = this.getOne(new LambdaQueryWrapper<Label>()
                .eq(Label::getProjectId, label.getProjectId())
                .eq(Label::getName, label.getName())
                .last("LIMIT 1"));
        if (existed != null) return existed;
        label.setCreatedAt(LocalDateTime.now());
        this.save(label);
        return label;
    }

    @Transactional
    public boolean removeLabel(Long id) {
        if (id == null) return false;
        return this.removeById(id);
    }
}
