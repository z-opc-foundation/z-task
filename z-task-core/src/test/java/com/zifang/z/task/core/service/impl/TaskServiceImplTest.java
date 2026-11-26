package com.zifang.z.task.core.service.impl;

import com.zifang.z.task.core.common.exception.BusinessException;
import com.zifang.z.task.core.domain.entity.Task;
import com.zifang.z.task.core.domain.entity.TaskAssignee;
import com.zifang.z.task.core.domain.entity.TaskList;
import com.zifang.z.task.core.domain.mapper.TaskAssigneeMapper;
import com.zifang.z.task.core.domain.mapper.TaskMapper;
import com.zifang.z.task.core.service.ProjectMemberService;
import com.zifang.z.task.core.service.TaskListService;
import com.zifang.z.task.core.support.Proxies;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * TaskServiceImpl 决策层单测: JDK 动态代理模拟 Mapper/Service, 内存 Map 充当存储,
 * 不触碰真实数据库 (家法: 零 Mockito, 沙箱安全).
 */
class TaskServiceImplTest {

    private static final Long LIST_ID = 100L;
    private static final Long OTHER_LIST_ID = 200L;
    private static final Long PROJECT_ID = 10L;
    private static final String MEMBER = "u1";
    private static final String BOSS = "boss";
    private static final String OUTSIDER = "u9";

    private TaskServiceImpl service;

    private Map<Long, Task> taskStore;
    private Map<String, TaskAssignee> assigneeStore;
    private Map<Long, TaskList> listStore;
    private Set<String> members;
    private List<TaskAssignee> deletedAssignees;

    @BeforeEach
    void setUp() {
        service = new TaskServiceImpl();
        taskStore = new ConcurrentHashMap<>();
        assigneeStore = new ConcurrentHashMap<>();
        listStore = new ConcurrentHashMap<>();
        members = new HashSet<>();
        deletedAssignees = new ArrayList<>();

        members.add(PROJECT_ID + "|" + MEMBER);
        members.add(PROJECT_ID + "|" + BOSS);
        listStore.put(LIST_ID, newList(LIST_ID, PROJECT_ID));

        // TaskMapper: 内存 Map 模拟 z_task_task 表
        Map<String, Proxies.Invocation> taskMapper = new HashMap<>();
        taskMapper.put("selectById", args -> taskStore.get(((Long) args[0])));
        taskMapper.put("insert", args -> {
            Task t = (Task) args[0];
            if (t.getId() == null) {
                t.setId((long) (taskStore.size() + 1));
            }
            taskStore.put(t.getId(), t);
            return 1;
        });
        taskMapper.put("updateById", args -> {
            Task t = (Task) args[0];
            taskStore.put(t.getId(), t);
            return 1;
        });
        taskMapper.put("selectCount", args -> (long) taskStore.values().stream()
                .filter(t -> LIST_ID.equals(t.getListId())).count());
        taskMapper.put("selectByListId", args -> byList((Long) args[0]));
        taskMapper.put("selectByProjectId", args -> new ArrayList<>(taskStore.values()));
        taskMapper.put("selectByAssignee", args -> new ArrayList<>(taskStore.values()));
        taskMapper.put("updatePosition", args -> {
            Task t = taskStore.get(args[0]);
            if (t != null) {
                t.setListId((Long) args[1]);
                t.setPosition((String) args[2]);
            }
            return 1;
        });
        Proxies.inject(service, "baseMapper", Proxies.of(TaskMapper.class, taskMapper));

        // TaskAssigneeMapper: 复合键 "taskId|userId" 模拟关联表
        Map<String, Proxies.Invocation> assigneeMapper = new HashMap<>();
        assigneeMapper.put("selectById", args -> {
            Object key = args[0];
            if (key instanceof TaskAssignee) {
                TaskAssignee k = (TaskAssignee) key;
                return assigneeStore.get(k.getTaskId() + "|" + k.getUserId());
            }
            return null;
        });
        assigneeMapper.put("insert", args -> {
            TaskAssignee a = (TaskAssignee) args[0];
            assigneeStore.put(a.getTaskId() + "|" + a.getUserId(), a);
            return 1;
        });
        assigneeMapper.put("delete", args -> {
            deletedAssignees.add(new TaskAssignee(1L, "captured"));
            return 1;
        });
        Proxies.inject(service, "taskAssigneeMapper",
                Proxies.of(TaskAssigneeMapper.class, assigneeMapper));

        // ProjectMemberService: Set 模拟成员关系
        Map<String, Proxies.Invocation> memberService = new HashMap<>();
        memberService.put("isMember", args ->
                members.contains(args[0] + "|" + args[1]));
        memberService.put("getMember", args ->
                members.contains(args[0] + "|" + args[1]) ? new com.zifang.z.task.core.domain.entity.ProjectMember() : null);
        Proxies.inject(service, "projectMemberService",
                Proxies.of(ProjectMemberService.class, memberService));

        // TaskListService: 内存 Map 模拟列表
        Map<String, Proxies.Invocation> listService = new HashMap<>();
        listService.put("getById", args -> listStore.get(((Long) args[0])));
        Proxies.inject(service, "taskListService",
                Proxies.of(TaskListService.class, listService));
    }

    private List<Task> byList(Long listId) {
        List<Task> out = new ArrayList<>();
        for (Task t : taskStore.values()) {
            if (listId.equals(t.getListId())) {
                out.add(t);
            }
        }
        return out;
    }

    private static TaskList newList(Long id, Long projectId) {
        TaskList l = new TaskList();
        l.setId(id);
        l.setBoardId(1000L);
        l.setName("todo");
        return l;
    }

    private Task newTask(String title) {
        Task t = new Task();
        t.setTitle(title);
        t.setProjectId(PROJECT_ID);
        t.setListId(LIST_ID);
        t.setCreatorId(MEMBER);
        return t;
    }

    // ========== createTask ==========

    @Test
    void createTask_listMissing_throwsNotFound() {
        Task t = newTask("bug");
        t.setListId(999L);
        BusinessException e = assertThrows(BusinessException.class, () -> service.createTask(t, MEMBER));
        assertEquals("列表不存在", e.getMessage());
    }

    @Test
    void createTask_nonMember_throwsReject() {
        Task t = newTask("bug");
        BusinessException e = assertThrows(BusinessException.class, () -> service.createTask(t, OUTSIDER));
        assertEquals("无权限在该项目中创建任务", e.getMessage());
    }

    @Test
    void createTask_member_ok_fillsDefaultsAndPosition() {
        Task t = newTask("bug");
        Task created = service.createTask(t, MEMBER);

        assertNotNull(created.getId());
        assertEquals(1, created.getPriority());
        assertEquals(0, created.getStatus());
        assertEquals(MEMBER, created.getCreatorId());
        assertEquals("0", created.getPosition());
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getUpdatedAt());
        assertTrue(taskStore.containsKey(created.getId()));
    }

    @Test
    void createTask_positionAppendsToEnd() {
        Task first = service.createTask(newTask("a"), MEMBER);
        first.setListId(LIST_ID);
        Task second = service.createTask(newTask("b"), MEMBER);

        assertEquals("0", first.getPosition());
        assertEquals("1", second.getPosition());
    }

    // ========== getTasksBy* (透传 mapper, 验证返回即存储视图) ==========

    @Test
    void getTasksByList_returnsStoredTasks() {
        service.createTask(newTask("a"), MEMBER);
        service.createTask(newTask("b"), MEMBER);

        List<Task> out = service.getTasksByList(LIST_ID);
        assertEquals(2, out.size());
    }

    // ========== moveTask ==========

    @Test
    void moveTask_missing_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.moveTask(999L, OTHER_LIST_ID, "0", MEMBER));
        assertEquals("任务不存在", e.getMessage());
    }

    @Test
    void moveTask_nonMember_throwsReject() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.moveTask(saved.getId(), OTHER_LIST_ID, "0", OUTSIDER));
        assertEquals("无权限移动该任务", e.getMessage());
    }

    @Test
    void moveTask_crossList_updatesListId() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        boolean ok = service.moveTask(saved.getId(), OTHER_LIST_ID, "5", MEMBER);

        assertTrue(ok);
        assertEquals(OTHER_LIST_ID, taskStore.get(saved.getId()).getListId());
        assertEquals("5", taskStore.get(saved.getId()).getPosition());
    }

    @Test
    void moveTask_sameList_keepsListIdAndUpdatesPosition() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        boolean ok = service.moveTask(saved.getId(), LIST_ID, "3", MEMBER);

        assertTrue(ok);
        assertEquals(LIST_ID, taskStore.get(saved.getId()).getListId());
        assertEquals("3", taskStore.get(saved.getId()).getPosition());
    }

    // ========== addAssignee ==========

    @Test
    void addAssignee_taskMissing_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.addAssignee(999L, MEMBER, MEMBER));
        assertEquals("任务不存在", e.getMessage());
    }

    @Test
    void addAssignee_operatorNotMember_throwsReject() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.addAssignee(saved.getId(), MEMBER, OUTSIDER));
        assertEquals("无权限修改该任务", e.getMessage());
    }

    @Test
    void addAssignee_targetNotMember_throwsParamError() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.addAssignee(saved.getId(), OUTSIDER, MEMBER));
        assertEquals("该用户不在项目中", e.getMessage());
    }

    @Test
    void addAssignee_duplicate_throwsParamError() {
        Task saved = service.createTask(newTask("a"), MEMBER);
        service.addAssignee(saved.getId(), MEMBER, MEMBER);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.addAssignee(saved.getId(), MEMBER, MEMBER));
        assertEquals("该用户已经是执行者", e.getMessage());
    }

    @Test
    void addAssignee_ok_inserts() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        assertTrue(service.addAssignee(saved.getId(), MEMBER, MEMBER));
        assertNotNull(assigneeStore.get(saved.getId() + "|" + MEMBER));
    }

    // ========== removeAssignee ==========

    @Test
    void removeAssignee_taskMissing_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.removeAssignee(999L, MEMBER, MEMBER));
        assertEquals("任务不存在", e.getMessage());
    }

    @Test
    void removeAssignee_unauthorizedOperator_throwsReject() {
        Task saved = service.createTask(newTask("a"), MEMBER);
        service.addAssignee(saved.getId(), MEMBER, MEMBER);

        final Long taskId = saved.getId();
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.removeAssignee(taskId, MEMBER, "other"));
        assertEquals("无权限移除执行者", e.getMessage());
    }

    @Test
    void removeAssignee_bySelf_ok() {
        Task saved = service.createTask(newTask("a"), MEMBER);
        service.addAssignee(saved.getId(), MEMBER, MEMBER);

        assertTrue(service.removeAssignee(saved.getId(), MEMBER, MEMBER));
    }

    @Test
    void removeAssignee_byCreator_ok() {
        // boss 建任务, MEMBER 是执行者且不同于 creator → 走 creator 分支而非 self 分支
        Task saved = service.createTask(newTask("a"), BOSS);
        service.addAssignee(saved.getId(), MEMBER, BOSS);

        assertTrue(service.removeAssignee(saved.getId(), MEMBER, saved.getCreatorId()));
    }

    // ========== completeTask / reopenTask ==========

    @Test
    void completeTask_ok_setsStatusAndCompletedAt() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        assertTrue(service.completeTask(saved.getId(), MEMBER));

        Task done = taskStore.get(saved.getId());
        assertEquals(2, done.getStatus());
        assertNotNull(done.getCompletedAt());
    }

    @Test
    void completeTask_nonMember_throwsReject() {
        Task saved = service.createTask(newTask("a"), MEMBER);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.completeTask(saved.getId(), OUTSIDER));
        assertEquals("无权限完成该任务", e.getMessage());
    }

    @Test
    void reopenTask_ok_clearsStatusAndCompletedAt() {
        Task saved = service.createTask(newTask("a"), MEMBER);
        service.completeTask(saved.getId(), MEMBER);

        assertTrue(service.reopenTask(saved.getId(), MEMBER));

        Task reopened = taskStore.get(saved.getId());
        assertEquals(0, reopened.getStatus());
        assertNull(reopened.getCompletedAt());
    }

    @Test
    void reopenTask_missing_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.reopenTask(999L, MEMBER));
        assertEquals("任务不存在", e.getMessage());
    }
}
