package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zifang.z.task.core.domain.entity.ProjectMember;

import java.util.List;

/**
 * 项目成员表 Service
 *
 * @author zifang
 */
public interface ProjectMemberService extends IService<ProjectMember> {

    /**
     * 查询用户参与的所有项目ID
     *
     * @param userId 用户ID
     * @return 项目ID列表
     */
    List<Long> getProjectIdsByUserId(String userId);

    /**
     * 查询项目成员
     *
     * @param projectId 项目ID
     * @param userId    用户ID
     * @return 成员信息
     */
    ProjectMember getMember(Long projectId, String userId);

    /**
     * 判断用户是否是项目成员
     *
     * @param projectId 项目ID
     * @param userId    用户ID
     * @return 是否是成员
     */
    boolean isMember(Long projectId, String userId);

    /**
     * 添加项目成员
     *
     * @param projectId 项目ID
     * @param userId    用户ID
     * @param role      角色
     * @return 是否成功
     */
    boolean addMember(Long projectId, String userId, Integer role);

    /**
     * 移除项目成员
     *
     * @param projectId 项目ID
     * @param userId    用户ID
     * @return 是否成功
     */
    boolean removeMember(Long projectId, String userId);
}
