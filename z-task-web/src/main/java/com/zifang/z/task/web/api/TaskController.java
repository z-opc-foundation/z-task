package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.Task;
import com.zifang.z.task.core.service.TaskService;
import com.zifang.z.task.web.api.request.TaskReq;
import com.zifang.z.task.web.api.response.TaskResp;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 任务管理 Controller (z-task 业务核心).
 * <p>
 * API 基础路径: /api/task
 * 所属模块: z-task-web
 * 鉴权: z-ctc-sso SsoInterceptor 自动拦截, userId 从 request attribute "ssoUser" 读取.
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/task/list — 按任务列表查询任务</li>
 *   <li>GET /api/task/project/list — 按项目查询任务</li>
 *   <li>GET /api/task/assignee/list — 按负责人查询任务</li>
 *   <li>POST /api/task — 创建任务</li>
 *   <li>PUT /api/task/move — 移动任务 (拖拽)</li>
 *   <li>POST /api/task/assignees/add — 添加执行者</li>
 *   <li>POST /api/task/assignees/remove — 移除执行者</li>
 *   <li>POST /api/task/complete — 完成任务</li>
 *   <li>POST /api/task/reopen — 重新打开任务</li>
 * </ul>
 */
@Tag(name = "任务管理")
@RestController("zTaskTaskController")
@RequestMapping("/api/task")
public class TaskController {

    @Resource
    private TaskService zTaskService;

    /**
     * 从 HttpServletRequest 中获取当前登录用户的用户名.
     *
     * @param request HTTP 请求对象
     * @return 当前用户名, 未登录时返回 null
     */
    private String userId(HttpServletRequest request) {
        UserInfo u = (UserInfo) request.getAttribute("ssoUser");
        return u != null ? u.getUsername() : null;
    }

    private TaskResp toResp(Task task) {
        TaskResp resp = new TaskResp();
        BeanUtils.copyProperties(task, resp);
        return resp;
    }

    /**
     * 任务列表 (按任务列表).
     *
     * @param listId 任务列表 ID
     * @return 任务列表
     */
    @Operation(summary = "任务列表（按列表）")
    @GetMapping("/list")
    public Result<List<TaskResp>> listByList(@RequestParam Long listId) {
        return Result.success(zTaskService.getTasksByList(listId).stream()
                .map(this::toResp).collect(Collectors.toList()));
    }

    /**
     * 任务列表 (按项目).
     *
     * @param projectId 项目 ID
     * @return 任务列表
     */
    @Operation(summary = "任务列表（按项目）")
    @GetMapping("/project/list")
    public Result<List<TaskResp>> listByProject(@RequestParam Long projectId) {
        return Result.success(zTaskService.getTasksByProject(projectId).stream()
                .map(this::toResp).collect(Collectors.toList()));
    }

    /**
     * 任务列表 (按负责人).
     *
     * @param userId 负责人用户 ID
     * @param assignee 负责人用户 ID (与 userId 等价的兼容参数)
     * @return 任务列表
     */
    @Operation(summary = "任务列表（按负责人）")
    @GetMapping("/assignee/list")
    public Result<List<TaskResp>> listByAssignee(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "assignee", required = false) String assignee) {
        // E2E 修复: 兼容前端 makeApi('task').listByAssignee(assignee=1) 这种调用 — assignee 和 userId 等价
        String resolved = (assignee != null && !assignee.isEmpty()) ? assignee : userId;
        if (resolved == null || resolved.isEmpty()) {
            return Result.<List<TaskResp>>fail("缺少参数: userId").code(400);
        }
        return Result.success(zTaskService.getTasksByAssignee(resolved).stream()
                .map(this::toResp).collect(Collectors.toList()));
    }

    /**
     * 创建任务.
     *
     * @param req     任务请求体
     * @param request HTTP 请求, 用于提取当前用户
     * @return 创建后的任务
     */
    @Operation(summary = "创建任务")
    @PostMapping
    public Result<TaskResp> create(@RequestBody TaskReq req, HttpServletRequest request) {
        Task task = new Task();
        BeanUtils.copyProperties(req, task);
        return Result.success(toResp(zTaskService.createTask(task, userId(request))));
    }

    /**
     * 移动任务 (拖拽).
     *
     * @param taskId       任务 ID
     * @param targetListId 目标任务列表 ID
     * @param position     位置 (可选)
     * @param request      HTTP 请求, 用于提取当前用户
     * @return 是否移动成功
     */
    @Operation(summary = "移动任务（拖拽）")
    @PutMapping("/move")
    public Result<Boolean> move(@RequestParam Long taskId,
                                @RequestParam Long targetListId,
                                @RequestParam(required = false) String position,
                                HttpServletRequest request) {
        return Result.success(zTaskService.moveTask(taskId, targetListId, position, userId(request)));
    }

    /**
     * 添加执行者.
     *
     * @param taskId  任务 ID
     * @param userId  被添加的执行者用户 ID
     * @param request HTTP 请求, 用于提取当前操作人
     * @return 是否添加成功
     */
    @Operation(summary = "添加执行者")
    @PostMapping("/assignees/add")
    public Result<Boolean> addAssignee(@RequestParam Long taskId,
                                       @RequestParam String userId,
                                       HttpServletRequest request) {
        return Result.success(zTaskService.addAssignee(taskId, userId, userId(request)));
    }

    /**
     * 移除执行者.
     *
     * @param taskId  任务 ID
     * @param userId  被移除的执行者用户 ID
     * @param request HTTP 请求, 用于提取当前操作人
     * @return 是否移除成功
     */
    @Operation(summary = "移除执行者")
    @PostMapping("/assignees/remove")
    public Result<Boolean> removeAssignee(@RequestParam Long taskId,
                                          @RequestParam String userId,
                                          HttpServletRequest request) {
        return Result.success(zTaskService.removeAssignee(taskId, userId, userId(request)));
    }

    /**
     * 完成任务.
     *
     * @param taskId  任务 ID
     * @param request HTTP 请求, 用于提取当前用户
     * @return 是否完成成功
     */
    @Operation(summary = "完成任务")
    @PostMapping("/complete")
    public Result<Boolean> complete(@RequestParam Long taskId, HttpServletRequest request) {
        return Result.success(zTaskService.completeTask(taskId, userId(request)));
    }

    /**
     * 重新打开任务.
     *
     * @param taskId  任务 ID
     * @param request HTTP 请求, 用于提取当前用户
     * @return 是否重新打开成功
     */
    @Operation(summary = "重新打开任务")
    @PostMapping("/reopen")
    public Result<Boolean> reopen(@RequestParam Long taskId, HttpServletRequest request) {
        return Result.success(zTaskService.reopenTask(taskId, userId(request)));
    }
}
