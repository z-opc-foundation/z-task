package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zifang.z.task.core.domain.entity.Task;

import java.util.List;

/**
 * 任务表 Service
 *
 * @author zifang
 */
public interface TaskService extends IService<Task> {

    /**
     * 创建任务
     *
     * @param task   任务信息
     * @param userId 创建者ID
     * @return 创建后的任务
     */
    Task createTask(Task task, String userId);

    /**
     * 获取列表下的所有任务
     *
     * @param listId 列表ID
     * @return 任务列表
     */
    List<Task> getTasksByList(Long listId);

    /**
     * 获取项目下的所有任务
     *
     * @param projectId 项目ID
     * @return 任务列表
     */
    List<Task> getTasksByProject(Long projectId);

    /**
     * 获取分配给用户的任务
     *
     * @param userId 用户ID
     * @return 任务列表
     */
    List<Task> getTasksByAssignee(String userId);

    /**
     * 移动任务（拖拽排序）
     *
     * @param taskId       任务ID
     * @param targetListId 目标列表ID
     * @param position     位置
     * @param userId       操作用户ID
     * @return 是否成功
     */
    boolean moveTask(Long taskId, Long targetListId, String position, String userId);

    /**
     * 添加任务执行者
     *
     * @param taskId     任务ID
     * @param userId     用户ID
     * @param operatorId 操作者ID
     * @return 是否成功
     */
    boolean addAssignee(Long taskId, String userId, String operatorId);

    /**
     * 移除任务执行者
     *
     * @param taskId     任务ID
     * @param userId     用户ID
     * @param operatorId 操作者ID
     * @return 是否成功
     */
    boolean removeAssignee(Long taskId, String userId, String operatorId);

    /**
     * 完成任务
     *
     * @param taskId 任务ID
     * @param userId 操作用户ID
     * @return 是否成功
     */
    boolean completeTask(Long taskId, String userId);

    /**
     * 重新打开任务
     *
     * @param taskId 任务ID
     * @param userId 操作用户ID
     * @return 是否成功
     */
    boolean reopenTask(Long taskId, String userId);
}
