package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.BaseStatusCode;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.integration.team.RemoteTeamClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 待办详情里的**跨域能力代理**（z-task → z-team）。
 *
 * <h3>为什么有这组端点</h3>
 * 待办（todo）能力已于 2026-11-02 从 z-team 迁到 z-task，前端 {@code TodoTab} 也随之搬到
 * z-task-component。但待办详情里有 5 个能力**不属于待办域**，它们的归属方仍是 z-team：
 * <ul>
 *   <li>个人笔记（笔记树 / 详情 / 收藏 / 分享）</li>
 *   <li>个人 Agent（派发目标列表）</li>
 *   <li>员工搜索（指派候选）</li>
 *   <li>群聊场景（事项关联的群聊项目）</li>
 *   <li>图片上传（编辑器插图）</li>
 * </ul>
 * z-task 后端**没有**这些 endpoint ⇒ 前端若直接调 z-team 就成了前端跨域调用。
 *
 * <p>⇒ 本控制器把这 5 类能力**代理**到 z-team，让前端只需面对
 * {@code /api/todo/cross/**} 一组同源端点。
 * <p>这与「待办数据从 z-team 迁出」是<b>反向的一条链</b>：待办数据在 z-task，
 * 跨域附属能力在 z-team，两边互调。
 *
 * <h3>鉴权</h3>
 * 与 {@link TodoController} 同一口径：优先取 SSO 的 {@code ssoUser}，
 * 回退 {@code ?token=}。解析出的 userId 透传给 z-team（z-team 侧
 * {@code TeamCurrentUserResolver.requireUser(token)} 用它判权限）。
 *
 * @author z-task
 * @since 1.0.0
 */
@Tag(name = "待办-跨域能力代理")
@RestController("zTaskTodoCrossDomainController")
@RequestMapping("/api/todo/cross")
public class TodoCrossDomainController {

    @Resource
    private RemoteTeamClient teamClient;

    /* ────────────────────────── 个人笔记 ────────────────────────── */

    @Operation(summary = "笔记树（代理 z-team）")
    @GetMapping("/notes/tree")
    public Result<Object> noteTree(@RequestParam(required = false, defaultValue = "") String token,
                                    HttpServletRequest request) {
        try {
            return Result.success(teamClient.noteTree(requireUserId(request, token)));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    @Operation(summary = "笔记详情（代理 z-team）")
    @GetMapping("/notes/{id}")
    public Result<Object> noteDetail(@PathVariable String id,
                                      @RequestParam(required = false, defaultValue = "") String token,
                                      HttpServletRequest request) {
        try {
            return Result.success(teamClient.noteDetail(requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    @Operation(summary = "更新笔记（代理 z-team）")
    @PutMapping("/notes/{id}")
    public Result<Object> updateNote(@PathVariable String id,
                                      @RequestBody Map<String, Object> body,
                                      @RequestParam(required = false, defaultValue = "") String token,
                                      HttpServletRequest request) {
        try {
            return Result.success(teamClient.updateNote(requireUserId(request, token), id, body));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    @Operation(summary = "收藏夹（代理 z-team）")
    @GetMapping("/notes/favorites")
    public Result<Object> noteFavorites(@RequestParam(required = false, defaultValue = "") String token,
                                         HttpServletRequest request) {
        try {
            return Result.success(teamClient.noteFavorites(requireUserId(request, token)));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    @Operation(summary = "收藏笔记（代理 z-team）")
    @PostMapping("/notes/{id}/favorite")
    public Result<Object> favoriteNote(@PathVariable String id,
                                        @RequestParam(required = false, defaultValue = "") String token,
                                        HttpServletRequest request) {
        try {
            return Result.success(teamClient.favoriteNote(requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    @Operation(summary = "取消收藏（代理 z-team）")
    @PostMapping("/notes/{id}/unfavorite")
    public Result<Object> unfavoriteNote(@PathVariable String id,
                                          @RequestParam(required = false, defaultValue = "") String token,
                                          HttpServletRequest request) {
        try {
            return Result.success(teamClient.unfavoriteNote(requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    @Operation(summary = "分享笔记（代理 z-team）")
    @PostMapping("/notes/{id}/share")
    public Result<Object> shareNote(@PathVariable String id,
                                     @RequestParam(required = false, defaultValue = "") String token,
                                     HttpServletRequest request) {
        try {
            return Result.success(teamClient.shareNote(requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    /* ────────────────────────── 个人 Agent ────────────────────────── */

    @Operation(summary = "个人 Agent 列表（代理 z-team）")
    @GetMapping("/agents")
    public Result<Object> personalAgents(@RequestParam(required = false, defaultValue = "") String token,
                                          HttpServletRequest request) {
        try {
            return Result.success(teamClient.personalAgents(requireUserId(request, token)));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    /* ────────────────────────── 员工搜索 ────────────────────────── */

    @Operation(summary = "员工目录搜索（代理 z-team）")
    @GetMapping("/staff")
    public Result<Object> searchStaff(@RequestParam(required = false, defaultValue = "") String keyword,
                                       @RequestParam(required = false, defaultValue = "0") long agentId,
                                       @RequestParam(required = false, defaultValue = "") String token,
                                       HttpServletRequest request) {
        try {
            return Result.success(teamClient.searchStaff(requireUserId(request, token), agentId, keyword));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    /* ────────────────────────── 群聊场景 ────────────────────────── */

    @Operation(summary = "群聊场景实例列表（代理 z-team）")
    @GetMapping("/scenarios")
    public Result<Object> scenarioInstances(@RequestParam(required = false, defaultValue = "") String createTimeStart,
                                             @RequestParam(required = false, defaultValue = "") String token,
                                             HttpServletRequest request) {
        try {
            return Result.success(teamClient.scenarioInstances(requireUserId(request, token), createTimeStart));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        }
    }

    /* ────────────────────────── 图片上传 ────────────────────────── */

    @Operation(summary = "图片上传（代理 z-team）")
    @PostMapping("/images")
    public Result<Object> uploadImage(@RequestParam("file") MultipartFile file,
                                       @RequestParam(required = false, defaultValue = "") String token,
                                       HttpServletRequest request) {
        try {
            if (file == null || file.isEmpty()) {
                return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, "图片不能为空");
            }
            String filename = file.getOriginalFilename() == null ? "upload.png" : file.getOriginalFilename();
            String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
            return Result.success(teamClient.uploadImage(requireUserId(request, token), file.getBytes(),
                    filename, contentType));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, e.getMessage());
        } catch (java.io.IOException e) {
            return Result.error(BaseStatusCode.UNKNOWN_ERROR, "读取上传文件失败：" + e.getMessage());
        }
    }

    /* ────────────────────────── 内部 ────────────────────────── */

    /**
     * 解析当前用户 id。
     *
     * <p>优先用 SSO 注入的 {@code ssoUser}；回退 {@code ?token=} 参数。
     */
    private String userId(HttpServletRequest request, String token) {
        UserInfo u = (UserInfo) request.getAttribute("ssoUser");
        if (u != null && u.getUserId() != null && !u.getUserId().trim().isEmpty()) {
            return u.getUserId();
        }
        if (token != null && !token.trim().isEmpty()) {
            return token.trim();
        }
        return null;
    }

    private String requireUserId(HttpServletRequest request, String token) {
        String uid = userId(request, token);
        if (uid == null || uid.trim().isEmpty()) {
            throw new IllegalArgumentException("未登录：请通过平台 Cookie/SSO 访问");
        }
        return uid;
    }
}
