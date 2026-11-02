package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zifang.util.json.JsonUtil;
import com.zifang.z.task.core.domain.entity.TodoItem;
import com.zifang.z.task.core.domain.entity.TodoProject;
import com.zifang.z.task.core.domain.mapper.TodoItemMapper;
import com.zifang.z.task.core.domain.mapper.TodoProjectMapper;
import com.zifang.z.task.core.service.dto.TodoProjectBundle;
import com.zifang.z.task.core.service.dto.TodoProjectBundle.TodoMember;
import com.zifang.z.task.core.service.dto.TodoProjectBundle.TodoProjectSummary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 待办项目服务：项目 CRUD + 成员管理 + 可见性判定。
 *
 * <p>权限规则：可见 = owner 或（shared 且在 members 内）；编辑同可见（成员可编辑）；
 * 项目删除/改名/成员管理仅 owner。members 以 {@code [{userId,userName}]} JSON 存储。
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code com.zifang.z.team.core.service.todo.TodoProjectService}）。
 * 业务语义逐字保留，只把「z-team userId」措辞改成「z-ctc userId」（两侧取值同源）。
 *
 * @author z-task
 */
@Service("zTaskTodoProjectService")
public class TodoProjectService {

    @Resource
    private TodoProjectMapper todoProjectMapper;

    @Resource
    private TodoItemMapper todoItemMapper;

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

    /**
     * 项目列表（我拥有的 + 我加入的两组，含未完成计数与成员明细）。
     */
    public TodoProjectBundle listBundle(String userId) {
        List<TodoProject> all = todoProjectMapper.selectList(
                new LambdaQueryWrapper<TodoProject>()
                        .orderByAsc(TodoProject::getSortOrder)
                        .orderByAsc(TodoProject::getId));
        List<TodoProject> owned = new ArrayList<>();
        List<TodoProject> joined = new ArrayList<>();
        for (TodoProject p : all) {
            if (userId.equals(p.getUserId())) {
                owned.add(p);
            } else if (isMember(userId, p)) {
                joined.add(p);
            }
        }
        TodoProjectBundle bundle = new TodoProjectBundle();
        bundle.setOwned(toSummaries(owned));
        bundle.setJoined(toSummaries(joined));
        return bundle;
    }

    /**
     * 当前用户可见的项目 id 集合（收集箱语义在事项侧单独处理）。
     */
    public List<Long> visibleProjectIds(String userId) {
        List<TodoProject> all = todoProjectMapper.selectList(null);
        return all.stream()
                .filter(p -> isVisible(userId, p))
                .map(TodoProject::getId)
                .collect(Collectors.toList());
    }

    /**
     * 新建项目（默认私有）。
     */
    public TodoProject create(String userId, String title, String icon, String visibility) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("项目名不能为空");
        }
        TodoProject project = new TodoProject();
        project.setUserId(userId);
        project.setTitle(title.trim());
        project.setIcon(icon);
        project.setVisibility(
                TodoProject.VISIBILITY_SHARED.equalsIgnoreCase(visibility)
                        ? TodoProject.VISIBILITY_SHARED
                        : TodoProject.VISIBILITY_PRIVATE);
        project.setMembers("[]");
        project.setSortOrder(0);
        todoProjectMapper.insert(project);
        return project;
    }

    /**
     * 更新项目（仅 owner）。
     */
    public TodoProject update(String userId, Long projectId, String title, String icon,
                              String description, String visibility, Integer sortOrder,
                              String extraInfo) {
        TodoProject project = requireOwner(userId, projectId);
        if (title != null && !title.trim().isEmpty()) {
            project.setTitle(title.trim());
        }
        if (icon != null) {
            project.setIcon(icon);
        }
        if (description != null) {
            project.setDescription(description);
        }
        if (visibility != null) {
            project.setVisibility(
                    TodoProject.VISIBILITY_SHARED.equalsIgnoreCase(visibility)
                            ? TodoProject.VISIBILITY_SHARED
                            : TodoProject.VISIBILITY_PRIVATE);
        }
        if (sortOrder != null) {
            project.setSortOrder(sortOrder);
        }
        if (extraInfo != null) {
            project.setExtraInfo(normalizeExtraInfo(extraInfo));
        }
        todoProjectMapper.updateById(project);
        return project;
    }

    /**
     * 扩展信息归一化：必须是 JSON object。
     *
     * <p>非法值直接抛 {@link IllegalArgumentException}（Controller 转 400），
     * 而不是原样写库 —— 写进去的脏数据会让前端 {@code parseStatusColumns}
     * 每次都回落到默认列，用户看着像「保存没生效」，却查不出原因。
     *
     * @param extraInfo 原始 JSON 字符串；空白视为清空
     * @return 归一化后的 JSON 字符串；空串/null 返回 null
     */
    private static String normalizeExtraInfo(String extraInfo) {
        String trimmed = extraInfo.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        try {
            // 必须转成 java.util.Map 判断：JsonUtil.parseObject 返回的是 z-util 自研的
            // JsonObject（不是 java.util.Map），直接 instanceof Map 会永远判不中。
            Map<String, Object> parsed = JsonUtil.parseToMap(trimmed);
            if (parsed == null) {
                throw new IllegalArgumentException("扩展信息必须是 JSON object");
            }
            return trimmed;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("扩展信息必须是合法 JSON");
        }
    }

    /**
     * 删除项目（仅 owner，项目下事项级联逻辑删除）。
     */
    @Transactional(rollbackFor = Exception.class)
    public void delete(String userId, Long projectId) {
        requireOwner(userId, projectId);
        List<TodoItem> items = todoItemMapper.selectList(
                new LambdaQueryWrapper<TodoItem>().eq(TodoItem::getProjectId, projectId));
        for (TodoItem item : items) {
            todoItemMapper.deleteById(item.getId());
        }
        todoProjectMapper.deleteById(projectId);
    }

    /**
     * 添加成员（仅 owner；成员不能是 owner 自己、不能重复）。
     */
    public TodoProject addMember(String userId, Long projectId, String memberUserId,
                                 String memberUserName) {
        TodoProject project = requireOwner(userId, projectId);
        if (memberUserId == null || memberUserId.trim().isEmpty()) {
            throw new IllegalArgumentException("成员 userId 不能为空");
        }
        if (memberUserId.trim().equals(project.getUserId())) {
            throw new IllegalArgumentException("不能把自己添加为成员（你已是 owner）");
        }
        List<TodoMember> members = parseMembers(project);
        for (TodoMember m : members) {
            if (m.getUserId().equals(memberUserId.trim())) {
                throw new IllegalArgumentException("该成员已在项目中");
            }
        }
        members.add(new TodoMember(memberUserId.trim(),
                memberUserName == null ? memberUserId.trim() : memberUserName.trim()));
        project.setMembers(writeMembers(members));
        project.setVisibility(TodoProject.VISIBILITY_SHARED);
        todoProjectMapper.updateById(project);
        return project;
    }

    /**
     * 移除成员（仅 owner）。
     */
    public TodoProject removeMember(String userId, Long projectId, String memberUserId) {
        TodoProject project = requireOwner(userId, projectId);
        List<TodoMember> members = parseMembers(project);
        boolean removed = members.removeIf(m -> m.getUserId().equals(memberUserId));
        if (!removed) {
            throw new IllegalArgumentException("该成员不在项目中");
        }
        project.setMembers(writeMembers(members));
        todoProjectMapper.updateById(project);
        return project;
    }

    /**
     * 批量调整项目排序（侧栏拖拽落地）。仅 owner；updates 元素：{id, sortOrder}。
     */
    @Transactional(rollbackFor = Exception.class)
    public void reorderBatch(String userId, List<Map<String, Object>> updates) {
        if (updates == null || updates.isEmpty()) {
            return;
        }
        for (Map<String, Object> u : updates) {
            Long id = toLong(u.get("id"));
            Integer sortOrder = toInteger(u.get("sortOrder"));
            if (id == null || sortOrder == null) {
                continue;
            }
            TodoProject project = requireOwner(userId, id);
            project.setSortOrder(sortOrder);
            todoProjectMapper.updateById(project);
        }
    }

    /**
     * 可见性：owner 或（shared 且在 members 内）。
     */
    public boolean isVisible(String userId, TodoProject project) {
        if (project == null) {
            return false;
        }
        if (userId.equals(project.getUserId())) {
            return true;
        }
        return TodoProject.VISIBILITY_SHARED.equals(project.getVisibility())
                && isMember(userId, project);
    }

    /* ────────── 私有辅助 ────────── */

    /**
     * 校验项目可见并返回实体，否则抛出异常。
     */
    public TodoProject requireVisible(String userId, Long projectId) {
        TodoProject project = projectId == null ? null : todoProjectMapper.selectById(projectId);
        if (!isVisible(userId, project)) {
            throw new IllegalArgumentException("项目不存在或无权访问");
        }
        return project;
    }

    /**
     * 校验指派目标合法性：owner 或项目成员。
     */
    public void requireAssignable(String userId, TodoProject project, String assigneeUserId) {
        if (assigneeUserId == null || assigneeUserId.trim().isEmpty()) {
            return;
        }
        String target = assigneeUserId.trim();
        if (target.equals(project.getUserId())) {
            return;
        }
        for (TodoMember m : parseMembers(project)) {
            if (m.getUserId().equals(target)) {
                return;
            }
        }
        throw new IllegalArgumentException("指派对象必须是项目成员");
    }

    private TodoProject requireOwner(String userId, Long projectId) {
        TodoProject project = projectId == null ? null : todoProjectMapper.selectById(projectId);
        if (project == null || !userId.equals(project.getUserId())) {
            throw new IllegalArgumentException("项目不存在或仅 owner 可操作");
        }
        return project;
    }

    private boolean isMember(String userId, TodoProject project) {
        for (TodoMember m : parseMembers(project)) {
            if (m.getUserId().equals(userId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * members JSON 字符串 → 成员列表（坏数据容错为空列表）
     */
    public List<TodoMember> parseMembers(TodoProject project) {
        String raw = project.getMembers();
        if (raw == null || raw.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            TodoMember[] arr = JsonUtil.fromJson(raw, TodoMember[].class);
            return new ArrayList<>(Arrays.asList(arr));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String writeMembers(List<TodoMember> members) {
        try {
            return JsonUtil.toJson(members == null ? Collections.emptyList() : members);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<TodoProjectSummary> toSummaries(List<TodoProject> projects) {
        List<TodoProjectSummary> result = new ArrayList<>();
        for (TodoProject p : projects) {
            TodoProjectSummary s = new TodoProjectSummary();
            s.setId(p.getId());
            s.setUserId(p.getUserId());
            s.setTitle(p.getTitle());
            s.setIcon(p.getIcon());
            s.setDescription(p.getDescription());
            s.setVisibility(p.getVisibility());
            s.setMembers(p.getMembers());
            s.setSortOrder(p.getSortOrder());
            // 这行不能漏：TodoProjectSummary 继承自 TodoProject, 所以字段是有的,
            // 但不显式赋值它就永远是 null —— 前端 parseStatusColumns 拿不到配置，
            // 每次都回落到默认列，表现为「保存成功但列配置不生效」。
            s.setExtraInfo(p.getExtraInfo());
            s.setCreateBy(p.getCreateBy());
            s.setCreateTime(p.getCreateTime());
            s.setCreateByName(p.getCreateByName());
            s.setMemberDetails(parseMembers(p));
            s.setOpenCount(countOpen(p.getId()));
            result.add(s);
        }
        return result;
    }

    private long countOpen(Long projectId) {
        return todoItemMapper.selectCount(
                new LambdaQueryWrapper<TodoItem>()
                        .eq(TodoItem::getProjectId, projectId)
                        .in(TodoItem::getStatus, TodoItem.STATUS_TODO, TodoItem.STATUS_DOING));
    }
}
