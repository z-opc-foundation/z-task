package com.zifang.z.task.core.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zifang.util.core.meta.ResultCode;
import com.zifang.z.task.core.common.exception.BusinessException;
import com.zifang.z.task.core.domain.entity.Board;
import com.zifang.z.task.core.domain.entity.TaskList;
import com.zifang.z.task.core.domain.mapper.TaskListMapper;
import com.zifang.z.task.core.service.BoardService;
import com.zifang.z.task.core.service.ProjectMemberService;
import com.zifang.z.task.core.service.TaskListService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 列表表 Service 实现
 *
 * @author zifang
 */
@Service("zTaskTaskListServiceImpl")
public class TaskListServiceImpl extends ServiceImpl<TaskListMapper, TaskList> implements TaskListService {

    private static final Logger log = LogManager.getLogger(TaskListServiceImpl.class);

    @Autowired
    private BoardService boardService;

    @Autowired
    private ProjectMemberService projectMemberService;

    @Override
    public TaskList createList(TaskList taskList, String userId) {
        // 获取看板信息
        Board board = boardService.getById(taskList.getBoardId());
        if (board == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "看板不存在");
        }

        // 检查是否是项目成员
        if (!projectMemberService.isMember(board.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限在该看板下创建列表");
        }

        // 设置排序号
        Integer maxOrder = baseMapper.selectMaxSortOrder(taskList.getBoardId());
        taskList.setSortOrder(maxOrder != null ? maxOrder + 1 : 0);
        taskList.setIsArchived(0);
        taskList.setCreatedAt(LocalDateTime.now());
        taskList.setUpdatedAt(LocalDateTime.now());

        this.save(taskList);
        log.info("创建列表成功: listId={}, name={}, boardId={}", taskList.getId(), taskList.getName(), taskList.getBoardId());
        return taskList;
    }

    @Override
    public List<TaskList> getListsByBoard(Long boardId) {
        return baseMapper.selectByBoardId(boardId);
    }

    @Override
    public boolean archiveList(Long listId, String userId) {
        TaskList taskList = this.getById(listId);
        if (taskList == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "列表不存在");
        }

        // 获取看板信息以检查项目权限
        Board board = boardService.getById(taskList.getBoardId());
        if (board == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "看板不存在");
        }

        // 检查权限
        if (!projectMemberService.isMember(board.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限归档该列表");
        }

        taskList.setIsArchived(1);
        taskList.setUpdatedAt(LocalDateTime.now());

        boolean success = this.updateById(taskList);
        if (success) {
            log.info("归档列表成功: listId={}, operatorId={}", listId, userId);
        }
        return success;
    }

    @Override
    public boolean updateSortOrder(Long listId, Integer sortOrder) {
        TaskList taskList = this.getById(listId);
        if (taskList == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "列表不存在");
        }
        taskList.setSortOrder(sortOrder);
        taskList.setUpdatedAt(LocalDateTime.now());
        return this.updateById(taskList);
    }
}
