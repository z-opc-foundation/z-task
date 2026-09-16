package com.zifang.z.task.web.api;

import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.TaskLabel;
import com.zifang.z.task.core.service.TaskLabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 任务-标签关联 Controller.
 * <p>
 * API 基础路径: /api/task-label
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/task-label/task/{taskId} — 按任务查询关联</li>
 *   <li>GET /api/task-label/label/{labelId} — 按标签查询关联</li>
 *   <li>POST /api/task-label/task/{taskId}/label/{labelId} — 给任务添加标签</li>
 *   <li>DELETE /api/task-label/task/{taskId}/label/{labelId} — 从任务移除标签</li>
 * </ul>
 */
@Tag(name = "任务标签")
@RestController("zTaskTaskLabelController")
@RequestMapping("/api/task-label")
public class TaskLabelController {

    @Resource
    private TaskLabelService taskLabelService;

    /**
     * 按任务列关联.
     *
     * @param taskId 任务 ID
     * @return 该任务关联的标签列表
     */
    @Operation(summary = "按任务列关联")
    @GetMapping("/task")
    public Result<List<TaskLabel>> listByTask(@RequestParam Long taskId) {
        return Result.success(taskLabelService.listByTask(taskId));
    }

    /**
     * 按标签列关联.
     *
     * @param labelId 标签 ID
     * @return 该标签关联的任务列表
     */
    @Operation(summary = "按标签列关联")
    @GetMapping("/label")
    public Result<List<TaskLabel>> listByLabel(@RequestParam Long labelId) {
        return Result.success(taskLabelService.listByLabel(labelId));
    }

    /**
     * 给任务添加标签.
     *
     * @param taskId  任务 ID
     * @param labelId 标签 ID
     * @return 是否添加成功
     */
    @Operation(summary = "给任务添加标签")
    @PostMapping("/task/label/attach")
    public Result<Boolean> attach(@RequestParam Long taskId, @RequestParam Long labelId) {
        return Result.success(taskLabelService.attach(taskId, labelId));
    }

    /**
     * 从任务移除标签.
     *
     * @param taskId  任务 ID
     * @param labelId 标签 ID
     * @return 是否移除成功
     */
    @Operation(summary = "从任务移除标签")
    @DeleteMapping("/task/label/detach")
    public Result<Boolean> detach(@RequestParam Long taskId, @RequestParam Long labelId) {
        return Result.success(taskLabelService.detach(taskId, labelId));
    }
}
