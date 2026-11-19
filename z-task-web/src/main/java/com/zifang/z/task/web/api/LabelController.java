package com.zifang.z.task.web.api;

import com.zifang.util.core.meta.Result;
import com.zifang.z.meta.api.annotation.BizApi;
import com.zifang.z.meta.api.annotation.BizField;
import com.zifang.z.meta.api.annotation.BizParam;
import com.zifang.z.task.core.domain.entity.Label;
import com.zifang.z.task.core.service.LabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

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
    @BizApi(summary = "按项目列标签", description = "按项目列标签.", tags = { "z-task" })
    public Result<List<Label>> listByProject(@RequestParam @BizParam(name = "projectId", type = BizField.FieldType.INTEGER, description = "项目 ID", position = BizParam.Position.QUERY) Long projectId) {
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
    @BizApi(summary = "新建标签 (同名幂等)", description = "新建标签 (同名幂等).", tags = { "z-task" })
    public Result<Label> create(@RequestBody @BizParam(name = "label", type = BizField.FieldType.STRING, description = "标签实体", position = BizParam.Position.BODY) Label label) {
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
    @BizApi(summary = "删除标签", description = "删除标签.", tags = { "z-task" })
    public Result<Boolean> delete(@RequestParam @BizParam(name = "id", type = BizField.FieldType.INTEGER, description = "标签 ID", position = BizParam.Position.QUERY) Long id) {
        return Result.success(labelService.removeLabel(id));
    }
}



