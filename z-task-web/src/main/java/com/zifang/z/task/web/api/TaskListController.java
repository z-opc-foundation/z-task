package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.TaskList;
import com.zifang.z.task.core.service.TaskListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 任务列表 (看板中的列) Controller.
 * <p>
 * API 基础路径: /api/task-list
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截, userId 从 request attribute "ssoUser" 读取
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/task-list/board?boardId={boardId} — 按看板列任务列表</li>
 *   <li>GET /api/task-list/list?listId={id} — 按 listId 查（FE makeApi 友好）</li>
 *   <li>GET /api/task-list/page?pageNum=&pageSize= — 分页列出全部</li>
 *   <li>GET /api/task-list?id={id} — 查询任务列表详情</li>
 *   <li>POST /api/task-list — 新建任务列表</li>
 *   <li>PUT /api/task-list — 更新任务列表</li>
 *   <li>DELETE /api/task-list?id={id} — 删除任务列表</li>
 *   <li>PUT /api/task-list/archive?id={id} — 归档任务列表</li>
 *   <li>PUT /api/task-list/sort?id={id}&sortOrder={n} — 更新任务列表排序</li>
 * </ul>
 */
@Tag(name = "任务列表")
@RestController("zTaskTaskListController")
@RequestMapping("/api/task-list")
public class TaskListController {

    @Resource
    private TaskListService taskListService;

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

    /**
     * 按看板列任务列表.
     *
     * @param boardId 看板 ID
     * @return 该看板下的任务列表
     */
    @Operation(summary = "按看板列任务列表")
    @GetMapping("/board")
    public Result<List<TaskList>> listByBoard(@RequestParam Long boardId) {
        return Result.success(taskListService.getListsByBoard(boardId));
    }

    /**
     * 按 listId 列出 (FE makeApi('task-list').list 友好别名).
     * <p>{@code GET /api/task-list/list?listId=1} — 单条 listId 时返回单条;不带参数时列出全部.</p>
     */
    @Operation(summary = "按 listId 列出 (makeApi 友好)")
    @GetMapping("/list")
    public Result<List<TaskList>> listByListIdAlias(
            @RequestParam(required = false) Long listId) {
        if (listId == null) {
            return Result.success(taskListService.list());
        }
        TaskList single = taskListService.getById(listId);
        return Result.success(single == null ? java.util.Collections.emptyList() : java.util.Collections.singletonList(single));
    }

    /**
     * 分页列出所有任务列表 (FE makeApi('task-list').page 友好别名).
     * <p>{@code GET /api/task-list/page?pageNum=1&pageSize=20}</p>
     */
    @Operation(summary = "分页列出 (makeApi 友好)")
    @GetMapping("/page")
    public Result<com.baomidou.mybatisplus.core.metadata.IPage<TaskList>> pageAlias(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<TaskList> page =
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNum, pageSize);
        return Result.success(taskListService.page(page));
    }

    /**
     * 查询任务列表详情.
     *
     * @param id 任务列表 ID
     * @return 任务列表详情
     */
    @Operation(summary = "详情")
    @GetMapping
    public Result<TaskList> get(@RequestParam(required = false) Long id) {
        if (id == null) {
            return Result.success(null);
        }
        return Result.success(taskListService.getById(id));
    }

    /**
     * 新建任务列表.
     *
     * @param taskList 任务列表实体
     * @param request  HTTP 请求, 用于提取当前用户
     * @return 创建后的任务列表
     */
    @Operation(summary = "新建任务列表")
    @PostMapping
    public Result<TaskList> create(@RequestBody TaskList taskList, HttpServletRequest request) {
        return Result.success(taskListService.createList(taskList, userId(request)));
    }

    /**
     * 更新任务列表.
     *
     * @param taskList 任务列表实体
     * @return 是否更新成功
     */
    @Operation(summary = "更新任务列表")
    @PutMapping
    public Result<Boolean> update(@RequestBody TaskList taskList) {
        return Result.success(taskListService.updateById(taskList));
    }

    /**
     * 删除任务列表.
     *
     * @param id 任务列表 ID
     * @return 是否删除成功
     */
    @Operation(summary = "删除任务列表")
    @DeleteMapping
    public Result<Boolean> delete(@RequestParam Long id) {
        return Result.success(taskListService.removeById(id));
    }

    /**
     * 归档任务列表.
     *
     * @param id      任务列表 ID
     * @param request HTTP 请求, 用于提取当前用户
     * @return 是否归档成功
     */
    @Operation(summary = "归档任务列表")
    @PutMapping("/archive")
    public Result<Boolean> archive(@RequestParam Long id, HttpServletRequest request) {
        return Result.success(taskListService.archiveList(id, userId(request)));
    }

    /**
     * 更新任务列表排序.
     *
     * @param id        任务列表 ID
     * @param sortOrder 新的排序值
     * @return 是否更新成功
     */
    @Operation(summary = "更新排序")
    @PutMapping("/sort")
    public Result<Boolean> updateSort(@RequestParam Long id, @RequestParam Integer sortOrder) {
        return Result.success(taskListService.updateSortOrder(id, sortOrder));
    }
}
