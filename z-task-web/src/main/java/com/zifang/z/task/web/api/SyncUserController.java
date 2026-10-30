package com.zifang.z.task.web.api;

import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.SyncUser;
import com.zifang.z.task.core.service.SyncUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;

/**
 * 用户同步 Controller (z-task 镜像 z-ctc-ac 用户表).
 * <p>
 * API 基础路径: /api/sync-user
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截
 * <p>
 * z-task 业务方调 z-ctc-ac 接口拿用户列表, 然后调本 controller 同步到 z_task_sync_user.
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/sync-user/{userId} — 按 userId 查询同步用户</li>
 *   <li>POST /api/sync-user/sync — 同步或更新用户</li>
 * </ul>
 */
@Tag(name = "用户同步")
@RestController("zTaskSyncUserController")
@RequestMapping("/api/sync-user")
public class SyncUserController {

    @Resource
    private SyncUserService syncUserService;

    /**
     * 按 userId 查询同步用户.
     *
     * @param userId 用户 ID
     * @return 同步用户记录
     */
    @Operation(summary = "按 userId 查")
    @GetMapping
    public Result<SyncUser> getByUserId(@RequestParam String userId) {
        return Result.success(syncUserService.getByUserId(userId));
    }

    /**
     * 同步或更新用户.
     *
     * @param syncUser 同步用户实体
     * @return 是否同步成功
     */
    @Operation(summary = "同步或更新用户")
    @PostMapping("/sync")
    public Result<Boolean> sync(@RequestBody SyncUser syncUser) {
        return Result.success(syncUserService.syncUser(syncUser));
    }
}
