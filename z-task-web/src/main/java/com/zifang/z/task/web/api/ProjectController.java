package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.service.ProjectBizService;
import com.zifang.z.task.core.service.dto.ProjectDTO;
import com.zifang.z.task.web.api.request.ProjectReq;
import com.zifang.z.task.web.api.response.ProjectResp;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 项目管理 Controller.
 * <p>
 * API 基础路径: /api/project
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截, userId 从 request attribute "ssoUser" 读取
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/project/user/list — 获取当前用户参与的项目</li>
 *   <li>POST /api/project — 创建项目</li>
 *   <li>PUT /api/project/{projectId} — 更新项目</li>
 *   <li>PUT /api/project/{projectId}/archive — 归档项目</li>
 * </ul>
 */
@Tag(name = "项目管理")
@RestController("zTaskProjectController")
@RequestMapping("/api/project")
public class ProjectController {

    @Resource
    private ProjectBizService projectBizService;

    /**
     * 从 HttpServletRequest 中获取当前登录用户的 ID.
     *
     * @param request HTTP 请求对象
     * @return 当前用户 ID, 未登录时返回 null
     */
    private String userId(HttpServletRequest request) {
        UserInfo u = (UserInfo) request.getAttribute("ssoUser");
        return u != null ? u.getUserId() : null;
    }

    /**
     * 获取当前用户参与的项目.
     *
     * @param request HTTP 请求, 用于提取当前用户
     * @return 当前用户参与的项目列表
     */
    @Operation(summary = "获取当前用户参与的项目")
    @GetMapping("/user/list")
    public Result<List<ProjectResp>> listByUser(HttpServletRequest request) {
        List<ProjectResp> data = projectBizService.listByUser(userId(request)).stream()
                .map(this::toResp).collect(Collectors.toList());
        return Result.success(data);
    }

    /**
     * 创建项目.
     *
     * @param req     项目创建请求
     * @param request HTTP 请求, 用于提取当前用户
     * @return 创建后的项目
     */
    @Operation(summary = "创建项目")
    @PostMapping
    public Result<ProjectResp> create(@RequestBody ProjectReq req, HttpServletRequest request) {
        ProjectDTO dto = new ProjectDTO();
        BeanUtils.copyProperties(req, dto);
        return Result.success(toResp(projectBizService.create(dto, userId(request))));
    }

    /**
     * 更新项目.
     *
     * @param projectId 项目 ID
     * @param req       项目更新请求
     * @param request   HTTP 请求, 用于提取当前用户
     * @return 更新后的项目
     */
    @Operation(summary = "更新项目")
    @PutMapping
    public Result<ProjectResp> update(@RequestParam Long projectId, @RequestBody ProjectReq req, HttpServletRequest request) {
        req.setId(projectId);
        ProjectDTO dto = new ProjectDTO();
        BeanUtils.copyProperties(req, dto);
        return Result.success(toResp(projectBizService.update(dto, userId(request))));
    }

    /**
     * 归档项目.
     *
     * @param projectId 项目 ID
     * @param request   HTTP 请求, 用于提取当前用户
     * @return 是否归档成功
     */
    @Operation(summary = "归档项目")
    @PutMapping("/archive")
    public Result<Boolean> archive(@RequestParam Long projectId, HttpServletRequest request) {
        return Result.success(projectBizService.archive(projectId, userId(request)));
    }

    /**
     * 将 ProjectDTO 转换为 ProjectResp.
     *
     * @param dto 内部传输对象
     * @return 响应对象; dto 为 null 时返回 null
     */
    private ProjectResp toResp(ProjectDTO dto) {
        if (dto == null) return null;
        ProjectResp resp = new ProjectResp();
        BeanUtils.copyProperties(dto, resp);
        return resp;
    }
}
