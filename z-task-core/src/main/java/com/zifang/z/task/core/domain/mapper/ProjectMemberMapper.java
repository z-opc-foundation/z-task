package com.zifang.z.task.core.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zifang.z.task.core.domain.entity.ProjectMember;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@org.springframework.stereotype.Component("zTaskProjectMemberMapper")
public interface ProjectMemberMapper extends BaseMapper<ProjectMember> {

    @Select("SELECT project_id FROM z_task_project_member WHERE user_id = #{userId}")
    List<Long> selectProjectIdsByUserId(@Param("userId") String userId);

    @Select("SELECT * FROM z_task_project_member WHERE project_id = #{projectId} AND user_id = #{userId}")
    ProjectMember selectByProjectAndUser(@Param("projectId") Long projectId, @Param("userId") String userId);

    @Select("SELECT COUNT(1) FROM z_task_project_member WHERE project_id = #{projectId} AND user_id = #{userId}")
    int selectCountByProjectAndUser(@Param("projectId") Long projectId, @Param("userId") String userId);
}
