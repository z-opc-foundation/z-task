package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zifang.z.task.core.domain.entity.TaskList;

import java.util.List;

/**
 * 列表表 Service
 *
 * @author zifang
 */
public interface TaskListService extends IService<TaskList> {

    /**
     * 创建列表
     *
     * @param taskList 列表信息
     * @param userId   创建者ID
     * @return 创建后的列表
     */
    TaskList createList(TaskList taskList, String userId);

    /**
     * 获取看板下的所有列表
     *
     * @param boardId 看板ID
     * @return 列表列表
     */
    List<TaskList> getListsByBoard(Long boardId);

    /**
     * 归档列表
     *
     * @param listId 列表ID
     * @param userId 操作用户ID
     * @return 是否成功
     */
    boolean archiveList(Long listId, String userId);

    /**
     * 更新列表排序
     *
     * @param listId    列表ID
     * @param sortOrder 排序号
     * @return 是否成功
     */
    boolean updateSortOrder(Long listId, Integer sortOrder);
}
