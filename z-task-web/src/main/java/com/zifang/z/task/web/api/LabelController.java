package com.zifang.z.task.web.api;

import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.Label;
import com.zifang.z.task.core.service.LabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 标签管理 Controller.
 * <p>
 * API 基础路径: /api/label
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/label/project/{projectId} — 按项目查询标签列表</li>
 *   <li>POST /api/label — 新建标签 (同名幂等)</li>
 *   <li>DELETE /api/label/{id} — 删除标签</li>
 * </ul>
 */
@Tag(name = "标签")
@RestController("zTaskLabelController")
@RequestMapping("/api/label")
public class LabelController {

    @Resource
    private LabelService labelService;

    /**
     * 按项目列标签.
     *
     * @param projectId 项目 ID
     * @return 标签列表
     */
    @Operation(summary = "按项目列标签")
    @GetMapping("/project")
    public Result<List<Label>> listByProject(@RequestParam Long projectId) {
        return Result.success(labelService.listByProject(projectId));
    }

    /**
     * 新建标签 (同名幂等).
     *
     * @param label 标签实体
     * @return 创建或已存在的标签
     */
    @Operation(summary = "新建标签 (同名幂等)")
    @PostMapping
    public Result<Label> create(@RequestBody Label label) {
        return Result.success(labelService.createLabel(label));
    }

    /**
     * 删除标签.
     *
     * @param id 标签 ID
     * @return 是否删除成功
     */
    @Operation(summary = "删除标签")
    @DeleteMapping
    public Result<Boolean> delete(@RequestParam Long id) {
        return Result.success(labelService.removeLabel(id));
    }
}
