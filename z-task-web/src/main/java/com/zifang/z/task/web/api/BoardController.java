package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.Board;
import com.zifang.z.task.core.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 看板管理 Controller.
 * <p>
 * API 基础路径: /api/board
 * 所属模块: z-task-web
 * 鉴权: SsoInterceptor 自动拦截, userId 从 request attribute "ssoUser" 读取
 *
 * <p>主要端点:
 * <ul>
 *   <li>GET /api/board/project/{projectId} — 按项目查询看板列表</li>
 *   <li>GET /api/board/{id} — 查询看板详情</li>
 *   <li>POST /api/board — 新建看板</li>
 *   <li>PUT /api/board — 更新看板</li>
 *   <li>DELETE /api/board/{id} — 删除看板</li>
 *   <li>PUT /api/board/{id}/sort — 更新看板排序</li>
 * </ul>
 */
@Tag(name = "看板管理")
@RestController("zTaskBoardController")
@RequestMapping("/api/board")
public class BoardController {

    @Resource
    private BoardService boardService;

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
     * 按项目列看板.
     *
     * @param projectId 项目 ID
     * @return 看板列表
     */
    @Operation(summary = "按项目列看板")
    @GetMapping("/project")
    public Result<List<Board>> listByProject(@RequestParam Long projectId) {
        return Result.success(boardService.getBoardsByProject(projectId));
    }

    /**
     * 查询看板详情.
     *
     * @param id 看板 ID
     * @return 看板详情
     */
    @Operation(summary = "详情")
    @GetMapping
    public Result<Board> get(@RequestParam(required = false) Long id) {
        if (id == null) {
            // 没有 id 时返回 null,避免空指针
            return Result.success(null);
        }
        return Result.success(boardService.getById(id));
    }

    /**
     * 新建看板.
     *
     * @param board   看板实体
     * @param request HTTP 请求, 用于提取当前用户
     * @return 创建后的看板
     */
    @Operation(summary = "新建看板")
    @PostMapping
    public Result<Board> create(@RequestBody Board board, HttpServletRequest request) {
        board.setCreatedAt(LocalDateTime.now());
        board.setUpdatedAt(LocalDateTime.now());
        if (board.getSortOrder() == null) board.setSortOrder(0L);
        return Result.success(boardService.createBoard(board, userId(request)));
    }

    /**
     * 更新看板.
     *
     * @param board 看板实体
     * @return 是否更新成功
     */
    @Operation(summary = "更新看板")
    @PutMapping
    public Result<Boolean> update(@RequestBody Board board) {
        board.setUpdatedAt(LocalDateTime.now());
        return Result.success(boardService.updateById(board));
    }

    /**
     * 删除看板.
     *
     * @param id 看板 ID
     * @return 是否删除成功
     */
    @Operation(summary = "删除看板")
    @DeleteMapping
    public Result<Boolean> delete(@RequestParam Long id) {
        return Result.success(boardService.removeById(id));
    }

    /**
     * 更新看板排序.
     *
     * @param id        看板 ID
     * @param sortOrder 新的排序值
     * @return 是否更新成功
     */
    @Operation(summary = "更新排序")
    @PutMapping("/sort")
    public Result<Boolean> updateSort(@RequestParam Long id, @RequestParam Long sortOrder) {
        return Result.success(boardService.updateSortOrder(id, sortOrder));
    }
}
