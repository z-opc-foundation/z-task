package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zifang.util.json.JsonUtil;
import com.zifang.z.task.core.domain.entity.TodoItem;
import com.zifang.z.task.core.domain.entity.TodoProject;
import com.zifang.z.task.core.domain.mapper.TodoItemMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 待办事项服务：事项 CRUD + 视图查询 + 完成/重开/排序。
 *
 * <p>可见性：可见项目内的事项全员可见可编辑；收集箱（projectId=null）仅创建人可见。
 * 删除仅创建人或项目 owner。指派目标必须是项目成员或 owner。
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code com.zifang.z.team.core.service.todo.TodoItemService}）。
 *
 * @author z-task
 */
@Service("zTaskTodoItemService")
public class TodoItemService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 手动排序优先（拖拽序），截止日期仅作同序兜底
     */
    private static final Comparator<TodoItem> ITEM_ORDER =
            Comparator.comparing(TodoItem::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(TodoItem::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(TodoItem::getId);

    @Resource
    private TodoItemMapper todoItemMapper;

    @Resource
    private TodoProjectService todoProjectService;

    private static Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer toInteger(Object value) {
        Long v = toLong(value);
        return v == null ? null : v.intValue();
    }

    private static String normalizePriority(String priority) {
        if (priority == null || priority.trim().isEmpty()) {
            return TodoItem.PRIORITY_MEDIUM;
        }
        switch (priority.trim().toUpperCase()) {
            case "HIGH":
            case "P0":
                return TodoItem.PRIORITY_HIGH;
            case "LOW":
            case "P2":
                return TodoItem.PRIORITY_LOW;
            default:
                return TodoItem.PRIORITY_MEDIUM;
        }
    }

    private static String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return TodoItem.STATUS_TODO;
        }
        switch (status.trim().toUpperCase()) {
            case "DOING":
                return TodoItem.STATUS_DOING;
            case "DONE":
                return TodoItem.STATUS_DONE;
            case "ARCHIVED":
                return TodoItem.STATUS_ARCHIVED;
            default:
                return TodoItem.STATUS_TODO;
        }
    }

    /**
     * "" / "null" / 空白 → null；其余 trim。
     */
    private static String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * "yyyy-MM-dd" → LocalDate；空/坏值 → null。
     */
    private static LocalDate parseDate(String value) {
        String v = normalizeNullable(value);
        if (v == null) {
            return null;
        }
        try {
            return LocalDate.parse(v, DATE_FMT);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * List/Map → JSON 字符串；String 原样；null → null。
     */
    private static String toJson(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            String s = ((String) value).trim();
            return s.isEmpty() ? null : s;
        }
        try {
            return JsonUtil.toJson(value);
        } catch (Exception e) {
            return null;
        }
    }

    /* ────────── 私有辅助 ────────── */

    /**
     * 视图查询。
     *
     * @param view      today|week|all|assigned|completed
     * @param projectId 项目过滤；0=收集箱；null=不过滤
     * @param status    状态覆盖过滤（可选）
     * @param keyword   标题模糊（可选）
     */
    public List<TodoItem> list(String userId, String view, Long projectId, String status,
                               String keyword) {
        List<Long> visibleIds = todoProjectService.visibleProjectIds(userId);
        LambdaQueryWrapper<TodoItem> qw = new LambdaQueryWrapper<>();
        // 权限：可见项目内 或 收集箱本人
        if (visibleIds.isEmpty()) {
            qw.isNull(TodoItem::getProjectId).eq(TodoItem::getUserId, userId);
        } else {
            qw.and(w -> w.in(TodoItem::getProjectId, visibleIds)
                    .or(w2 -> w2.isNull(TodoItem::getProjectId).eq(TodoItem::getUserId, userId)));
        }
        String v = view == null ? "all" : view.trim().toLowerCase();
        LocalDate today = LocalDate.now();
        switch (v) {
            case "today":
                qw.isNotNull(TodoItem::getDueDate)
                        .le(TodoItem::getDueDate, today)
                        .in(TodoItem::getStatus, TodoItem.STATUS_TODO, TodoItem.STATUS_DOING);
                break;
            case "week":
                qw.isNotNull(TodoItem::getDueDate)
                        .le(TodoItem::getDueDate, today.plusDays(7))
                        .in(TodoItem::getStatus, TodoItem.STATUS_TODO, TodoItem.STATUS_DOING);
                break;
            case "assigned":
                qw.eq(TodoItem::getAssigneeUserId, userId)
                        .in(TodoItem::getStatus, TodoItem.STATUS_TODO, TodoItem.STATUS_DOING);
                break;
            case "completed":
                qw.eq(TodoItem::getStatus, TodoItem.STATUS_DONE);
                break;
            case "all":
            default:
                qw.ne(TodoItem::getStatus, TodoItem.STATUS_ARCHIVED);
                break;
        }
        if (projectId != null) {
            if (projectId == 0L) {
                qw.isNull(TodoItem::getProjectId).eq(TodoItem::getUserId, userId);
            } else {
                qw.eq(TodoItem::getProjectId, projectId);
            }
        }
        if (status != null && !status.trim().isEmpty()) {
            qw.eq(TodoItem::getStatus, status.trim().toUpperCase());
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            qw.like(TodoItem::getTitle, keyword.trim());
        }
        List<TodoItem> items = todoItemMapper.selectList(qw);
        items.sort(ITEM_ORDER);
        return items;
    }

    /**
     * 新建事项。projectId 为 null 表示收集箱。
     */
    public TodoItem create(String userId, Long projectId, String title, String detail,
                           String priority, String dueDate, String assigneeUserId,
                           Object tags, Object links, Long parentId) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("事项标题不能为空");
        }
        TodoProject project = null;
        if (projectId != null && projectId > 0) {
            project = todoProjectService.requireVisible(userId, projectId);
        }
        TodoItem item = new TodoItem();
        item.setProjectId(projectId != null && projectId > 0 ? projectId : null);
        item.setUserId(userId);
        item.setTitle(title.trim());
        item.setDetail(detail);
        item.setStatus(TodoItem.STATUS_TODO);
        item.setPriority(normalizePriority(priority));
        item.setDueDate(parseDate(dueDate));
        if (project != null) {
            todoProjectService.requireAssignable(userId, project, assigneeUserId);
            item.setAssigneeUserId(normalizeNullable(assigneeUserId));
        }
        item.setTags(toJson(tags));
        item.setLinks(toJson(links));
        item.setParentId(parentId == null || parentId < 0 ? 0L : parentId);
        // 新事项排到同列表（项目/收集箱）末尾，避免全部落 0 导致手动序失效
        item.setSortOrder(nextTailSortOrder(item.getProjectId(), userId));
        todoItemMapper.insert(item);
        return item;
    }

    /**
     * 更新事项（可见即可编辑）。字段为 null 跳过；dueDate/assigneeUserId 传空串表示清空。
     */
    public TodoItem update(String userId, Long itemId, String title, String detail,
                           String priority, String dueDate, String status,
                           String assigneeUserId, Object tags, Object links, Long projectId) {
        TodoItem item = requireItemVisible(userId, itemId);
        if (title != null && !title.trim().isEmpty()) {
            item.setTitle(title.trim());
        }
        if (detail != null) {
            item.setDetail(detail);
        }
        if (priority != null) {
            item.setPriority(normalizePriority(priority));
        }
        if (dueDate != null) {
            item.setDueDate(parseDate(dueDate));
        }
        if (status != null && !status.trim().isEmpty()) {
            String next = normalizeStatus(status);
            if (!next.equals(item.getStatus())) {
                item.setStatus(next);
                // 与 complete/reopen 保持一致：直接改状态也维护完成人与完成时间
                if (TodoItem.STATUS_DONE.equals(next)) {
                    item.setCompletedAt(LocalDateTime.now());
                    item.setCompletedBy(userId);
                } else {
                    item.setCompletedAt(null);
                    item.setCompletedBy(null);
                }
            }
        }
        if (assigneeUserId != null) {
            TodoProject project = item.getProjectId() == null
                    ? null : todoProjectService.requireVisible(userId, item.getProjectId());
            if (project != null) {
                todoProjectService.requireAssignable(userId, project, assigneeUserId);
            }
            item.setAssigneeUserId(normalizeNullable(assigneeUserId));
        }
        if (tags != null) {
            item.setTags(toJson(tags));
        }
        if (links != null) {
            item.setLinks(toJson(links));
        }
        if (projectId != null && !projectId.equals(item.getProjectId() == null ? 0L : item.getProjectId())) {
            Long target = projectId > 0 ? projectId : null;
            if (target != null) {
                todoProjectService.requireVisible(userId, target);
            }
            item.setProjectId(target);
            // 移动项目时子树跟随，避免父子分家（子事项单独留在原项目）
            moveSubtree(item.getId(), null, target);
        }
        todoItemMapper.updateById(item);
        return item;
    }

    /**
     * 完成事项（可见即可操作；记录完成人与完成备注）。
     */
    public TodoItem complete(String userId, Long itemId, String result) {
        TodoItem item = requireItemVisible(userId, itemId);
        item.setStatus(TodoItem.STATUS_DONE);
        item.setCompletedAt(LocalDateTime.now());
        item.setCompletedBy(userId);
        if (result != null && !result.trim().isEmpty()) {
            String note = "\n\n> 完成：" + result.trim() + "（"
                    + LocalDateTime.now().format(DATE_FMT) + "）";
            item.setDetail((item.getDetail() == null ? "" : item.getDetail()) + note);
        }
        todoItemMapper.updateById(item);
        return item;
    }

    /**
     * 重开事项（DONE → TODO）。
     */
    public TodoItem reopen(String userId, Long itemId) {
        TodoItem item = requireItemVisible(userId, itemId);
        item.setStatus(TodoItem.STATUS_TODO);
        item.setCompletedAt(null);
        item.setCompletedBy(null);
        todoItemMapper.updateById(item);
        return item;
    }

    /**
     * 取一条对当前用户可见的事项（供派发 / 项目空间等外部服务复用）。
     *
     * @param userId 当前用户
     * @param itemId 事项 id
     * @return 事项实体
     * @throws IllegalArgumentException 不存在或无权访问
     */
    public TodoItem get(String userId, Long itemId) {
        return requireItemVisible(userId, itemId);
    }

    /**
     * 标记事项已派发给某个 Agent 会话（幂等键 = {@code agentSessionId}）。
     *
     * <p>派发后状态置 {@link TodoItem#STATUS_DOING}：待办从「待办」变成「进行中」，
     * 是用户视角唯一有意义的信号 —— Agent 是否真的干完由会话里的 {@code complete_todo}
     * 或用户手动勾选收口，本方法不预设完成。
     *
     * <p>⚠ {@code agentId}/{@code agentSessionId} 指向 z-team 的个人 Agent 与会话
     * （跨仓软外键，不建物理外键）。
     *
     * @param userId    当前用户
     * @param itemId    事项 id
     * @param agentId   目标 Agent id
     * @param sessionId 会话 id
     * @return 更新后的事项
     */
    @Transactional(rollbackFor = Exception.class)
    public TodoItem markDispatched(String userId, Long itemId, Long agentId, Long sessionId) {
        TodoItem item = requireItemVisible(userId, itemId);
        item.setAgentId(agentId);
        item.setAgentSessionId(sessionId);
        item.setStatus(TodoItem.STATUS_DOING);
        item.setCompletedAt(null);
        item.setCompletedBy(null);
        todoItemMapper.updateById(item);
        return item;
    }

    /**
     * 取消派发：清空 {@code agentId}/{@code agentSessionId}，状态回落 {@link TodoItem#STATUS_TODO}。
     *
     * <p>只解除绑定，<b>不删会话</b> —— 会话里可能已经有一段有价值的执行记录，
     * 删掉等于让用户丢掉产出。会话仍留在项目空间的「聊天记录」里。
     *
     * @param userId 当前用户
     * @param itemId 事项 id
     * @return 更新后的事项
     */
    @Transactional(rollbackFor = Exception.class)
    public TodoItem clearDispatch(String userId, Long itemId) {
        TodoItem item = requireItemVisible(userId, itemId);
        item.setAgentId(null);
        item.setAgentSessionId(null);
        if (TodoItem.STATUS_DOING.equals(item.getStatus())) {
            item.setStatus(TodoItem.STATUS_TODO);
        }
        todoItemMapper.updateById(item);
        return item;
    }

    /**
     * 调整排序（可同时移动到另一项目/收集箱）。
     */
    public TodoItem reorder(String userId, Long itemId, Integer sortOrder, Long projectId) {
        TodoItem item = requireItemVisible(userId, itemId);
        boolean projectChanged = false;
        if (sortOrder != null) {
            item.setSortOrder(sortOrder);
        }
        if (projectId != null) {
            Long target = projectId > 0 ? projectId : null;
            if (!Objects.equals(target, item.getProjectId())) {
                if (target != null) {
                    todoProjectService.requireVisible(userId, target);
                }
                item.setProjectId(target);
                projectChanged = true;
                // 跨列表移动且未指定排序时，自动排到目标列表末尾（Teambition 习惯）
                if (sortOrder == null) {
                    item.setSortOrder(nextTailSortOrder(target, userId));
                }
            }
        }
        todoItemMapper.updateById(item);
        if (projectChanged) {
            moveSubtree(itemId, null, item.getProjectId());
        }
        return item;
    }

    /**
     * 批量调整排序/移动（前端拖拽落地）。updates 元素：{id, sortOrder?, projectId?}。
     */
    @Transactional(rollbackFor = Exception.class)
    public void reorderBatch(String userId, List<Map<String, Object>> updates) {
        if (updates == null || updates.isEmpty()) {
            return;
        }
        for (Map<String, Object> u : updates) {
            Long id = toLong(u.get("id"));
            if (id == null) {
                continue;
            }
            reorder(userId, id, toInteger(u.get("sortOrder")), toLong(u.get("projectId")));
        }
    }

    /**
     * 删除事项（创建人或项目 owner；级联删除子事项）。
     */
    @Transactional(rollbackFor = Exception.class)
    public void delete(String userId, Long itemId) {
        TodoItem item = requireItemVisible(userId, itemId);
        boolean isCreator = userId.equals(item.getUserId());
        boolean isOwner = false;
        if (item.getProjectId() != null) {
            TodoProject project = todoProjectService.requireVisible(userId, item.getProjectId());
            isOwner = userId.equals(project.getUserId());
        }
        if (!isCreator && !isOwner) {
            throw new IllegalArgumentException("仅事项创建人或项目 owner 可删除");
        }
        deleteSubtree(itemId);
    }

    /**
     * 校验事项对当前用户可见（可见项目内 或 收集箱本人）并返回实体。
     */
    private TodoItem requireItemVisible(String userId, Long itemId) {
        TodoItem item = itemId == null ? null : todoItemMapper.selectById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("事项不存在");
        }
        if (item.getProjectId() == null) {
            if (!userId.equals(item.getUserId())) {
                throw new IllegalArgumentException("事项不存在或无权访问");
            }
            return item;
        }
        todoProjectService.requireVisible(userId, item.getProjectId());
        return item;
    }

    /**
     * 同列表（项目/收集箱）内末尾的排序值（间隔 10，留出拖拽插入空间）
     */
    private int nextTailSortOrder(Long projectId, String userId) {
        LambdaQueryWrapper<TodoItem> qw = new LambdaQueryWrapper<>();
        if (projectId != null) {
            qw.eq(TodoItem::getProjectId, projectId);
        } else {
            qw.isNull(TodoItem::getProjectId).eq(TodoItem::getUserId, userId);
        }
        qw.orderByDesc(TodoItem::getSortOrder).last("LIMIT 1");
        TodoItem last = todoItemMapper.selectOne(qw);
        return last == null || last.getSortOrder() == null ? 10 : last.getSortOrder() + 10;
    }

    /**
     * 递归跟随父事项移动项目（from 仅用于日志，无权限语义）
     */
    private void moveSubtree(Long itemId, Long from, Long to) {
        List<TodoItem> children = todoItemMapper.selectList(
                new LambdaQueryWrapper<TodoItem>().eq(TodoItem::getParentId, itemId));
        for (TodoItem child : children) {
            child.setProjectId(to);
            todoItemMapper.updateById(child);
            moveSubtree(child.getId(), from, to);
        }
    }

    /**
     * 递归逻辑删除事项及其子事项。
     */
    private void deleteSubtree(Long itemId) {
        List<TodoItem> children = todoItemMapper.selectList(
                new LambdaQueryWrapper<TodoItem>().eq(TodoItem::getParentId, itemId));
        for (TodoItem child : children) {
            deleteSubtree(child.getId());
        }
        todoItemMapper.deleteById(itemId);
    }
}
