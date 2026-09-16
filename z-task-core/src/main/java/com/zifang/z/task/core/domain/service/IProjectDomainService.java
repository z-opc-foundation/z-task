package com.zifang.z.task.core.domain.service;

import com.zifang.z.task.core.domain.entity.Project;

import java.util.List;

public interface IProjectDomainService {

    Project createProject(Project project, String ownerId);

    Project updateProject(Project project, String userId);

    List<Project> getUserProjects(String userId);

    boolean archiveProject(Long projectId, String userId);

    boolean isProjectMember(Long projectId, String userId);
}
