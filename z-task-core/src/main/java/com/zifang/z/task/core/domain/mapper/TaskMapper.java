package com.zifang.z.task.core.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zifang.z.task.core.domain.entity.Task;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@org.springframework.stereotype.Component("zTaskTaskMapper")
public interface TaskMapper extends BaseMapper<Task> {

    // 显式列名 + 别名, 与 entity 字段保持一致 (避免依赖 MyBatis Plus 自动 ResultMap).
    String TASK_COLS =
            "id, name AS title, description, project_id AS projectId, list_id AS listId, " +
                    "board_id AS boardId, status, priority, position, " +
                    "deadline AS dueDate, creator_id AS creatorId, " +
                    "completed_at AS completedAt, " +
                    "gmt_create AS createdAt, gmt_modified AS updatedAt";

    @Select("SELECT " + TASK_COLS + " FROM z_task_task WHERE list_id = #{listId} ORDER BY position ASC, id ASC")
    List<Task> selectByListId(@Param("listId") Long listId);

    @Select("SELECT " + TASK_COLS + " FROM z_task_task WHERE project_id = #{projectId} ORDER BY position ASC, id ASC")
    List<Task> selectByProjectId(@Param("projectId") Long projectId);

    @Select("SELECT " + TASK_COLS + " FROM z_task_task t " +
            "INNER JOIN z_task_task_assignee a ON t.id = a.task_id " +
            "WHERE a.user_id = #{userId} ORDER BY t.deadline ASC, t.id ASC")
    List<Task> selectByAssignee(@Param("userId") String userId);

    /**
     * 拖拽: 真更新 list_id + position + gmt_modified.
     */
    @Update("UPDATE z_task_task SET list_id = #{listId}, position = #{position}, gmt_modified = NOW() " +
            "WHERE id = #{taskId}")
    int updatePosition(@Param("taskId") Long taskId,
                       @Param("listId") Long listId,
                       @Param("position") String position);
}
