package com.zifang.z.task.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zifang.util.core.meta.ResultCode;
import com.zifang.z.task.core.common.exception.BusinessException;
import com.zifang.z.task.core.domain.entity.ProjectMember;
import com.zifang.z.task.core.domain.entity.Task;
import com.zifang.z.task.core.domain.entity.TaskAssignee;
import com.zifang.z.task.core.domain.entity.TaskList;
import com.zifang.z.task.core.domain.mapper.ProjectMemberMapper;
import com.zifang.z.task.core.domain.mapper.TaskAssigneeMapper;
import com.zifang.z.task.core.domain.mapper.TaskMapper;
import com.zifang.z.task.core.service.ProjectMemberService;
import com.zifang.z.task.core.service.TaskListService;
import com.zifang.z.task.core.service.TaskService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务表 Service 实现
 *
 * @author zifang
 */
@Service("zTaskServiceImpl")
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {

    private static final Logger log = LogManager.getLogger(TaskServiceImpl.class);

    @Autowired
    private TaskAssigneeMapper taskAssigneeMapper;

    @Autowired
    private ProjectMemberService projectMemberService;
    @Autowired
    private ProjectMemberMapper projectMemberMapper;

    @Autowired
    private TaskListService taskListService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Task createTask(Task task, String userId) {
        // 获取列表信息
        TaskList taskList = taskListService.getById(task.getListId());
        if (taskList == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "列表不存在");
        }

        boolean isMem = projectMemberService.isMember(task.getProjectId(), userId);
        int dbCount = projectMemberMapper.selectCountByProjectAndUser(task.getProjectId(), userId);
        if (!isMem || dbCount == 0) {
            ProjectMember mem = projectMemberService.getMember(task.getProjectId(), userId);
            int altCount = projectMemberMapper.selectCountByProjectAndUser(task.getProjectId(), "1");
            String memStr = mem == null ? "NULL" : mem.toString();
            throw new RuntimeException("DEBUG: projectId=" + task.getProjectId() + " userId=[" + userId + "] isMem=" + isMem + " dbCount(userId)=" + dbCount + " dbCountAlt=" + altCount + " mem=" + memStr);
        }

        // 设置默认值
        if (task.getPriority() == null) {
            task.setPriority(1); // 中优先级
        }
        if (task.getStatus() == null) {
            task.setStatus(0); // 待办
        }
        task.setCreatorId(userId);

        // 设置初始位置（排到列表末尾）
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getListId, task.getListId());
        long count = this.count(wrapper);
        task.setPosition(String.valueOf(count));

        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        this.save(task);
        log.info("创建任务成功: taskId={}, title={}, listId={}", task.getId(), task.getTitle(), task.getListId());
        return task;
    }

    @Override
    public List<Task> getTasksByList(Long listId) {
        return baseMapper.selectByListId(listId);
    }

    @Override
    public List<Task> getTasksByProject(Long projectId) {
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    public List<Task> getTasksByAssignee(String userId) {
        return baseMapper.selectByAssignee(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean moveTask(Long taskId, Long targetListId, String position, String userId) {
        Task task = this.getById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        // 检查是否是项目成员
        if (!projectMemberService.isMember(task.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限移动该任务");
        }

        // 如果是跨列表移动，更新列表ID
        if (!task.getListId().equals(targetListId)) {
            // 更新任务状态和位置
            baseMapper.updatePosition(taskId, targetListId, position);
            log.info("移动任务跨列表: taskId={}, fromList={}, toList={}, position={}",
                    taskId, task.getListId(), targetListId, position);
        } else {
            // 同列表内移动，只更新位置
            baseMapper.updatePosition(taskId, targetListId, position);
            log.info("移动任务同列表: taskId={}, listId={}, position={}", taskId, targetListId, position);
        }

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addAssignee(Long taskId, String userId, String operatorId) {
        Task task = this.getById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        // 检查操作者是否是项目成员
        if (!projectMemberService.isMember(task.getProjectId(), operatorId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限修改该任务");
        }

        // 检查要添加的用户是否是项目成员
        if (!projectMemberService.isMember(task.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.PARAM_VALID_ERROR, "该用户不在项目中");
        }

        // 检查是否已经是执行者
        TaskAssignee exist = taskAssigneeMapper.selectById(new TaskAssignee(taskId, userId));
        if (exist != null) {
            throw new BusinessException(ResultCode.PARAM_VALID_ERROR, "该用户已经是执行者");
        }

        // 添加执行者
        TaskAssignee assignee = new TaskAssignee();
        assignee.setTaskId(taskId);
        assignee.setUserId(userId);
        taskAssigneeMapper.insert(assignee);

        log.info("添加任务执行者成功: taskId={}, userId={}, operatorId={}", taskId, userId, operatorId);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean removeAssignee(Long taskId, String userId, String operatorId) {
        Task task = this.getById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        // 检查权限（执行者本人、任务创建者、项目所有者/管理员可以移除）
        if (!userId.equals(operatorId) && !task.getCreatorId().equals(operatorId)) {
            // TODO: 检查是否是项目所有者或管理员
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限移除执行者");
        }

        // 删除执行者
        LambdaQueryWrapper<TaskAssignee> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskAssignee::getTaskId, taskId);
        wrapper.eq(TaskAssignee::getUserId, userId);
        taskAssigneeMapper.delete(wrapper);

        log.info("移除任务执行者成功: taskId={}, userId={}, operatorId={}", taskId, userId, operatorId);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeTask(Long taskId, String userId) {
        Task task = this.getById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        // 检查是否是项目成员
        if (!projectMemberService.isMember(task.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限完成该任务");
        }

        task.setStatus(2); // 已完成
        task.setCompletedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        boolean success = this.updateById(task);
        if (success) {
            log.info("完成任务成功: taskId={}, operatorId={}", taskId, userId);
        }
        return success;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean reopenTask(Long taskId, String userId) {
        Task task = this.getById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        // 检查是否是项目成员
        if (!projectMemberService.isMember(task.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限重新打开该任务");
        }

        task.setStatus(0); // 待办
        task.setCompletedAt(null);
        task.setUpdatedAt(LocalDateTime.now());

        boolean success = this.updateById(task);
        if (success) {
            log.info("重新打开任务成功: taskId={}, operatorId={}", taskId, userId);
        }
        return success;
    }
}
