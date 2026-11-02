package com.zifang.z.task.web.api;

import com.zifang.ctc.sso.model.UserInfo;
import com.zifang.util.core.meta.BaseStatusCode;
import com.zifang.util.core.meta.Result;
import com.zifang.z.task.core.domain.entity.TodoItem;
import com.zifang.z.task.core.domain.entity.TodoProject;
import com.zifang.z.task.core.service.TodoItemService;
import com.zifang.z.task.core.service.TodoProjectService;
import com.zifang.z.task.core.service.TodoSpaceService;
import com.zifang.z.task.core.service.dto.TodoProjectBundle;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 待办 REST 接口：项目（{@code /api/todo/projects}）+ 事项（{@code /api/todo/items}）。
 *
 * <p>提供项目 CRUD、事项全生命周期管理、批量调整排序、成员协作、项目空间文件读写。
 *
 * <h3>鉴权</h3>
 * 用户 id 取自 SSO（{@code request.getAttribute("ssoUser")}），
 * 与 z-task 其余端点（{@code ProjectController}）同一口径。
 * 同时兼容 {@code ?token=} 入参 —— z-team 侧的代理与存量前端会带这个参数。
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code com.zifang.z.team.controller.personal.TodoController}）。
 * 路径与请求体**逐字保持**，使 z-team 侧代理可以零改写转发、存量前端零改动。
 *
 * <p>⚠ **待办 → Agent 派发不在这里**：派发要开 z-team 的个人 Agent 会话，
 * 那是 z-team 的独有能力，留在 z-team 侧并反向调用本模块的
 * {@code /items/{id}/dispatch-agent} 系列端点完成绑定。
 *
 * @author z-task
 * @since 1.0.0
 */
@Tag(name = "待办")
@RestController("zTaskTodoController")
@RequestMapping("/api/todo")
public class TodoController {

    @Resource
    private TodoProjectService todoProjectService;

    @Resource
    private TodoItemService todoItemService;

    /** 项目空间文件服务（{base-dir}/todo/{projectId}） */
    @Resource
    private TodoSpaceService todoSpaceService;

    // ──── 鉴权辅助 ────

    /**
     * 解析当前用户 id。
     *
     * <p>优先用 SSO 注入的 {@code ssoUser}；SsoInterceptor 放过某些路径时
     * 回退到 {@code ?token=} 参数（z-team 代理与存量前端会带）。
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

    private static String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static Long longOrNull(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer intOrNull(Object value) {
        Long v = longOrNull(value);
        return v == null ? null : v.intValue();
    }

    // ──── 项目 ────

    @Operation(summary = "项目列表（我拥有的 + 我加入的）")
    @GetMapping("/projects")
    public Result<TodoProjectBundle> listProjects(
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        return Result.success(
                todoProjectService.listBundle(requireUserId(request, token)));
    }

    @Operation(summary = "新建项目")
    @PostMapping("/projects")
    public Result<TodoProject> createProject(
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoProjectService.create(
                    requireUserId(request, token),
                    str(body.get("title")),
                    str(body.get("icon")),
                    str(body.get("visibility"))));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "取单个项目（owner 或成员可见）")
    @GetMapping("/projects/{id}")
    public Result<TodoProject> getProject(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoProjectService.requireVisible(requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "更新项目（仅 owner）")
    @PutMapping("/projects/{id}")
    public Result<TodoProject> updateProject(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            Integer sortOrder = intOrNull(body.get("sortOrder"));
            // extraInfo（项目空间扩展信息 JSON，当前承载看板列配置）必须读出来，
            // 否则前端传了被静默丢弃，保存列配置永远不生效。
            return Result.success(todoProjectService.update(
                    requireUserId(request, token), id,
                    str(body.get("title")),
                    str(body.get("icon")),
                    str(body.get("description")),
                    str(body.get("visibility")),
                    sortOrder,
                    str(body.get("extraInfo"))));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "删除项目（仅 owner，事项级联删除）")
    @DeleteMapping("/projects/{id}")
    public Result<Boolean> deleteProject(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            todoProjectService.delete(requireUserId(request, token), id);
            return Result.success(true);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "添加成员（仅 owner，自动转为 shared）")
    @PostMapping("/projects/{id}/members")
    public Result<TodoProject> addMember(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoProjectService.addMember(
                    requireUserId(request, token), id,
                    str(body.get("userId")),
                    str(body.get("userName"))));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "移除成员（仅 owner）")
    @DeleteMapping("/projects/{id}/members/{userId}")
    public Result<TodoProject> removeMember(
            @PathVariable Long id,
            @PathVariable String userId,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoProjectService.removeMember(
                    requireUserId(request, token), id, userId));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    // ──── 事项 ────

    @Operation(summary = "事项视图查询")
    @GetMapping("/items")
    public Result<List<TodoItem>> listItems(
            @RequestParam(required = false, defaultValue = "all") String view,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        return Result.success(todoItemService.list(
                requireUserId(request, token),
                view, projectId, status, keyword));
    }

    @Operation(summary = "新建事项（projectId 为空 = 收集箱）")
    @PostMapping("/items")
    public Result<TodoItem> createItem(
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoItemService.create(
                    requireUserId(request, token),
                    longOrNull(body.get("projectId")),
                    str(body.get("title")),
                    str(body.get("detail")),
                    str(body.get("priority")),
                    str(body.get("dueDate")),
                    str(body.get("assigneeUserId")),
                    body.get("tags"),
                    body.get("links"),
                    longOrNull(body.get("parentId"))));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "更新事项")
    @PutMapping("/items/{id}")
    public Result<TodoItem> updateItem(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoItemService.update(
                    requireUserId(request, token), id,
                    str(body.get("title")),
                    str(body.get("detail")),
                    str(body.get("priority")),
                    str(body.get("dueDate")),
                    str(body.get("status")),
                    str(body.get("assigneeUserId")),
                    body.get("tags"),
                    body.get("links"),
                    longOrNull(body.get("projectId"))));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "完成事项（记完成人与备注）")
    @PostMapping("/items/{id}/complete")
    public Result<TodoItem> completeItem(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String result = body == null ? null : str(body.get("result"));
            return Result.success(todoItemService.complete(
                    requireUserId(request, token), id, result));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "重开事项（DONE → TODO）")
    @PostMapping("/items/{id}/reopen")
    public Result<TodoItem> reopenItem(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoItemService.reopen(
                    requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "调整排序（可同时换项目，projectId=0 表示移入收集箱）")
    @PostMapping("/items/{id}/reorder")
    public Result<TodoItem> reorderItem(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            Integer sortOrder = body == null ? null : intOrNull(body.get("sortOrder"));
            Long projectId = body == null ? null : longOrNull(body.get("projectId"));
            return Result.success(todoItemService.reorder(
                    requireUserId(request, token), id, sortOrder, projectId));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "批量调整排序/移动（拖拽落地；updates=[{id,sortOrder?,projectId?}]）")
    @PostMapping("/items/reorder-batch")
    @SuppressWarnings("unchecked")
    public Result<Boolean> reorderItemsBatch(
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        Object raw = body == null ? null : body.get("updates");
        if (!(raw instanceof List)) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, "updates 不能为空");
        }
        try {
            todoItemService.reorderBatch(
                    requireUserId(request, token),
                    (List<Map<String, Object>>) raw);
            return Result.success(true);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "批量调整项目排序（侧栏拖拽；updates=[{id,sortOrder}]，仅 owner）")
    @PostMapping("/projects/reorder-batch")
    @SuppressWarnings("unchecked")
    public Result<Boolean> reorderProjectsBatch(
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        Object raw = body == null ? null : body.get("updates");
        if (!(raw instanceof List)) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, "updates 不能为空");
        }
        try {
            todoProjectService.reorderBatch(
                    requireUserId(request, token),
                    (List<Map<String, Object>>) raw);
            return Result.success(true);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "删除事项（创建人或项目 owner，子事项级联删除）")
    @DeleteMapping("/items/{id}")
    public Result<Boolean> deleteItem(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            todoItemService.delete(requireUserId(request, token), id);
            return Result.success(true);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    // ──── 待办 → Agent 派发的绑定动作（由 z-team 侧调用） ────
    //
    // 派发流程本身在 z-team（要开个人 Agent 会话），但「把 agentId/agentSessionId
    // 写回事项」这一步必须落到 z-task —— 事项在那儿。
    // ⇒ z-team 侧派发成功后回调这两个端点完成绑定。

    @Operation(summary = "标记事项已派发给 Agent 会话（由 z-team 回调）")
    @PostMapping("/items/{id}/dispatch-agent")
    public Result<TodoItem> markDispatched(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            Long agentId = body == null ? null : longOrNull(body.get("agentId"));
            Long sessionId = body == null ? null : longOrNull(body.get("agentSessionId"));
            return Result.success(todoItemService.markDispatched(
                    requireUserId(request, token), id, agentId, sessionId));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "取消派发绑定（由 z-team 回调；只解绑不删会话）")
    @PostMapping("/items/{id}/undispatch-agent")
    public Result<TodoItem> clearDispatch(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            return Result.success(todoItemService.clearDispatch(
                    requireUserId(request, token), id));
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    // ──── 项目空间（项目 = 服务器上一个文件夹） ────

    @Operation(summary = "项目空间目录树")
    @GetMapping("/projects/{id}/space/tree")
    public Result<Map<String, Object>> spaceTree(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "3") int depth,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String uid = requireUserId(request, token);
            TodoProject project = todoProjectService.requireVisible(uid, id);
            List<Map<String, Object>> entries = todoSpaceService.tree(id, depth);
            Map<String, Object> out = new HashMap<>();
            out.put("spaceId", id);
            out.put("title", project.getTitle());
            out.put("entries", entries);
            return Result.success(out);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "读项目空间文件（相对路径）")
    @GetMapping("/projects/{id}/space/file")
    public Result<Map<String, Object>> readSpaceFile(
            @PathVariable Long id,
            @RequestParam String path,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String uid = requireUserId(request, token);
            todoProjectService.requireVisible(uid, id);
            Map<String, Object> out = new HashMap<>();
            out.put("path", path);
            out.put("content", todoSpaceService.read(id, path));
            return Result.success(out);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "写项目空间文件（相对路径；自动建父目录）")
    @PutMapping("/projects/{id}/space/file")
    public Result<Map<String, Object>> writeSpaceFile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String uid = requireUserId(request, token);
            todoProjectService.requireVisible(uid, id);
            String path = str(body.get("path"));
            if (path == null || path.trim().isEmpty()) {
                return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, "path 不能为空");
            }
            boolean append = body.get("append") != null
                    && Boolean.parseBoolean(String.valueOf(body.get("append")));
            String saved = todoSpaceService.write(id, path, str(body.get("content")), append);
            Map<String, Object> out = new HashMap<>();
            out.put("path", saved);
            return Result.success(out);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "建项目空间目录（相对路径；递归创建）")
    @PostMapping("/projects/{id}/space/dir")
    public Result<Map<String, Object>> mkdirSpace(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String uid = requireUserId(request, token);
            todoProjectService.requireVisible(uid, id);
            String path = str(body.get("path"));
            if (path == null || path.trim().isEmpty()) {
                return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, "path 不能为空");
            }
            String created = todoSpaceService.mkdir(id, path);
            Map<String, Object> out = new HashMap<>();
            out.put("path", created);
            return Result.success(out);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "删项目空间文件/空目录（不递归删整棵树）")
    @DeleteMapping("/projects/{id}/space/file")
    public Result<Map<String, Object>> deleteSpaceFile(
            @PathVariable Long id,
            @RequestParam String path,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String uid = requireUserId(request, token);
            todoProjectService.requireVisible(uid, id);
            boolean deleted = todoSpaceService.delete(id, path);
            Map<String, Object> out = new HashMap<>();
            out.put("path", path);
            out.put("deleted", deleted);
            return Result.success(out);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }

    @Operation(summary = "检索项目空间（文件名 + 文本内容）")
    @GetMapping("/projects/{id}/space/search")
    public Result<Map<String, Object>> searchSpace(
            @PathVariable Long id,
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "20") int limit,
            @RequestParam(required = false, defaultValue = "") String token,
            HttpServletRequest request) {
        try {
            String uid = requireUserId(request, token);
            todoProjectService.requireVisible(uid, id);
            List<Map<String, Object>> hits = todoSpaceService.search(id, keyword, limit);
            Map<String, Object> out = new HashMap<>();
            out.put("keyword", keyword);
            out.put("count", hits.size());
            out.put("hits", hits);
            return Result.success(out);
        } catch (IllegalArgumentException e) {
            return Result.error(BaseStatusCode.PARAM_VALID_EXCEPTION, e.getMessage());
        }
    }
}
