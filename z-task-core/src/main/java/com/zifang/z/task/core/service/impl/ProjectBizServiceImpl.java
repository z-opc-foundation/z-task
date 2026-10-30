package com.zifang.z.task.core.service.impl;

import com.zifang.z.task.core.domain.entity.Project;
import com.zifang.z.task.core.domain.service.IProjectDomainService;
import com.zifang.z.task.core.service.ProjectBizService;
import com.zifang.z.task.core.service.dto.ProjectDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service("zTaskProjectBizServiceImpl")
public class ProjectBizServiceImpl implements ProjectBizService {

    @Resource
    private IProjectDomainService projectDomainService;

    private ProjectDTO toDTO(Project p) {
        if (p == null) return null;
        ProjectDTO dto = new ProjectDTO();
        BeanUtils.copyProperties(p, dto);
        return dto;
    }

    private Project toDO(ProjectDTO dto) {
        if (dto == null) return null;
        Project p = new Project();
        BeanUtils.copyProperties(dto, p);
        return p;
    }

    @Override
    public List<ProjectDTO> listByUser(String userId) {
        // 之前是 `if (list == null) return null;` —— 当 MyBatis 在空结果时返回 null，
        // controller 又对这个 null 调用 .stream()，会抛 NPE（code=510）。
        // 改为统一返回空集合，前端 res.data || [] 也能正确处理。
        List<Project> list = projectDomainService.getUserProjects(userId);
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public ProjectDTO create(ProjectDTO dto, String ownerId) {
        Project p = toDO(dto);
        Project created = projectDomainService.createProject(p, ownerId);
        return toDTO(created);
    }

    @Override
    public ProjectDTO update(ProjectDTO dto, String userId) {
        Project p = toDO(dto);
        Project updated = projectDomainService.updateProject(p, userId);
        return toDTO(updated);
    }

    public boolean archive(Long projectId, String userId) {
        return projectDomainService.archiveProject(projectId, userId);
    }

    @Override
    public boolean isMember(Long projectId, String userId) {
        return projectDomainService.isProjectMember(projectId, userId);
    }
}
