package com.zifang.z.task.core.service.impl;

import com.zifang.z.task.core.common.exception.BusinessException;
import com.zifang.z.task.core.domain.entity.Board;
import com.zifang.z.task.core.domain.entity.TaskList;
import com.zifang.z.task.core.domain.mapper.TaskListMapper;
import com.zifang.z.task.core.service.BoardService;
import com.zifang.z.task.core.service.ProjectMemberService;
import com.zifang.z.task.core.support.Proxies;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * TaskListServiceImpl 决策层单测: JDK 动态代理 + 内存 Map, 不触碰真实数据库.
 */
class TaskListServiceImplTest {

    private static final Long BOARD_ID = 500L;
    private static final Long PROJECT_ID = 10L;
    private static final String MEMBER = "u1";
    private static final String OUTSIDER = "u9";

    private TaskListServiceImpl service;

    private Map<Long, TaskList> listStore;
    private Map<Long, Board> boardStore;
    private Set<String> members;

    @BeforeEach
    void setUp() {
        service = new TaskListServiceImpl();
        listStore = new ConcurrentHashMap<>();
        boardStore = new ConcurrentHashMap<>();
        members = new HashSet<>();

        members.add(PROJECT_ID + "|" + MEMBER);

        Board board = new Board();
        board.setId(BOARD_ID);
        board.setName("main");
        board.setProjectId(PROJECT_ID);
        boardStore.put(BOARD_ID, board);

        // TaskListMapper: 内存 Map 模拟 z_task_task_list 表
        Map<String, Proxies.Invocation> listMapper = new HashMap<>();
        listMapper.put("selectById", args -> listStore.get(((Long) args[0])));
        listMapper.put("insert", args -> {
            TaskList l = (TaskList) args[0];
            if (l.getId() == null) {
                l.setId((long) (listStore.size() + 1));
            }
            listStore.put(l.getId(), l);
            return 1;
        });
        listMapper.put("updateById", args -> {
            TaskList l = (TaskList) args[0];
            listStore.put(l.getId(), l);
            return 1;
        });
        listMapper.put("selectMaxSortOrder", args -> maxSortOrder((Long) args[0]));
        listMapper.put("selectByBoardId", args -> {
            throw new UnsupportedOperationException("not needed in this suite");
        });
        Proxies.inject(service, "baseMapper", Proxies.of(TaskListMapper.class, listMapper));

        // BoardService: 内存 Map 模拟看板
        Map<String, Proxies.Invocation> boardService = new HashMap<>();
        boardService.put("getById", args -> boardStore.get(((Long) args[0])));
        Proxies.inject(service, "boardService", Proxies.of(BoardService.class, boardService));

        // ProjectMemberService: Set 模拟成员关系
        Map<String, Proxies.Invocation> memberService = new HashMap<>();
        memberService.put("isMember", args -> members.contains(args[0] + "|" + args[1]));
        Proxies.inject(service, "projectMemberService",
                Proxies.of(ProjectMemberService.class, memberService));
    }

    private Integer maxSortOrder(Long boardId) {
        int max = -1;
        for (TaskList l : listStore.values()) {
            if (boardId.equals(l.getBoardId()) && l.getSortOrder() != null && l.getSortOrder() > max) {
                max = l.getSortOrder();
            }
        }
        return max == -1 ? null : max;
    }

    private TaskList newList(String name) {
        TaskList l = new TaskList();
        l.setName(name);
        l.setBoardId(BOARD_ID);
        return l;
    }

    // ========== createList ==========

    @Test
    void createList_boardMissing_throwsNotFound() {
        TaskList l = newList("todo");
        l.setBoardId(999L);
        BusinessException e = assertThrows(BusinessException.class, () -> service.createList(l, MEMBER));
        assertEquals("看板不存在", e.getMessage());
    }

    @Test
    void createList_nonMember_throwsReject() {
        TaskList l = newList("todo");
        BusinessException e = assertThrows(BusinessException.class, () -> service.createList(l, OUTSIDER));
        assertEquals("无权限在该看板下创建列表", e.getMessage());
    }

    @Test
    void createList_ok_appendsSortOrder() {
        TaskList first = service.createList(newList("todo"), MEMBER);
        TaskList second = service.createList(newList("doing"), MEMBER);

        assertEquals(0, first.getSortOrder());
        assertEquals(1, second.getSortOrder());
        assertEquals(0, first.getIsArchived());
        assertNotNull(first.getCreatedAt());
        assertNotNull(first.getUpdatedAt());
        assertTrue(listStore.containsKey(first.getId()));
    }

    @Test
    void createList_emptyBoard_sortOrderZero() {
        TaskList first = service.createList(newList("todo"), MEMBER);
        assertEquals(0, first.getSortOrder());
    }

    // ========== archiveList ==========

    @Test
    void archiveList_missingList_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.archiveList(999L, MEMBER));
        assertEquals("列表不存在", e.getMessage());
    }

    @Test
    void archiveList_boardMissing_throwsNotFound() {
        TaskList l = service.createList(newList("todo"), MEMBER);
        boardStore.remove(BOARD_ID);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.archiveList(l.getId(), MEMBER));
        assertEquals("看板不存在", e.getMessage());
    }

    @Test
    void archiveList_nonMember_throwsReject() {
        TaskList l = service.createList(newList("todo"), MEMBER);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.archiveList(l.getId(), OUTSIDER));
        assertEquals("无权限归档该列表", e.getMessage());
    }

    @Test
    void archiveList_ok_setsArchivedFlag() {
        TaskList l = service.createList(newList("todo"), MEMBER);

        assertTrue(service.archiveList(l.getId(), MEMBER));

        assertEquals(1, listStore.get(l.getId()).getIsArchived());
    }

    // ========== updateSortOrder ==========

    @Test
    void updateSortOrder_missing_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.updateSortOrder(999L, 5));
        assertEquals("列表不存在", e.getMessage());
    }

    @Test
    void updateSortOrder_ok() {
        TaskList l = service.createList(newList("todo"), MEMBER);

        assertTrue(service.updateSortOrder(l.getId(), 7));

        assertEquals(7, listStore.get(l.getId()).getSortOrder());
    }
}
