package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.ProjectMember;
import com.zifang.z.task.core.service.ProjectMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 项目成员管理 Controller.
 * <p>
 * API 基础路径: /api/project-member
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/project-member/user/projects?userId={userId} — 按用户查询所有项目 ID</li>
 *   <li>GET /api/project-member/project/user?projectId={projectId}&userId={userId} — 查询项目成员详情</li>
 *   <li>POST /api/project-member/project/user/role?projectId={projectId}&userId={userId}&role={role} — 添加项目成员</li>
 *   <li>DELETE /api/project-member/project/user?projectId={projectId}&userId={userId} — 移除项目成员</li>
 * </ul>
 */
@Tag(name = "项目成员")
@RestController("zTaskProjectMemberController")
@RequestMapping("/api/project-member")
public class ProjectMemberController {

    @Resource
    private ProjectMemberService projectMemberService;

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
     * 按用户查所有项目 ID.
     *
     * @param userId 用户 ID
     * @return 该用户参与的项目 ID 列表
     */
    @Operation(summary = "按用户查所有项目 ID")
    @GetMapping("/user/projects")
    public Result<List<Long>> projectsByUser(@RequestParam String userId) {
        return Result.success(projectMemberService.getProjectIdsByUserId(userId));
    }

    /**
     * 查询项目成员详情.
     *
     * @param projectId 项目 ID
     * @param userId    用户 ID
     * @return 项目成员详情
     */
    @Operation(summary = "项目成员详情")
    @GetMapping("/project/user")
    public Result<ProjectMember> getMember(@RequestParam Long projectId, @RequestParam String userId) {
        return Result.success(projectMemberService.getMember(projectId, userId));
    }

    /**
     * 添加项目成员.
     *
     * @param projectId 项目 ID
     * @param userId    用户 ID
     * @param role      角色
     * @return 是否添加成功
     */
    @Operation(summary = "添加项目成员")
    @PostMapping("/project/user/role")
    public Result<Boolean> add(@RequestParam Long projectId,
                               @RequestParam String userId,
                               @RequestParam Integer role) {
        return Result.success(projectMemberService.addMember(projectId, userId, role));
    }

    /**
     * 移除项目成员.
     *
     * @param projectId 项目 ID
     * @param userId    用户 ID
     * @return 是否移除成功
     */
    @Operation(summary = "移除项目成员")
    @DeleteMapping("/project/user")
    public Result<Boolean> remove(@RequestParam Long projectId, @RequestParam String userId) {
        return Result.success(projectMemberService.removeMember(projectId, userId));
    }
}
