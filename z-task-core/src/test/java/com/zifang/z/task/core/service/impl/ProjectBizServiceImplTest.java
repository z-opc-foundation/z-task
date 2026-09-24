package com.zifang.z.task.core.service.impl;

import com.zifang.z.task.core.domain.entity.Project;
import com.zifang.z.task.core.domain.service.IProjectDomainService;
import com.zifang.z.task.core.service.dto.ProjectDTO;
import com.zifang.z.task.core.support.Proxies;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * ProjectBizServiceImpl 单测: 领域服务用 JDK 动态代理替身, 重点守护
 * listByUser 空结果统一返回空集合的回归 (历史上 domain 返回 null 导致 NPE code=510).
 */
class ProjectBizServiceImplTest {

    private static final String USER = "u1";

    private ProjectBizServiceImpl service;

    private Map<String, List<Project>> userProjects;
    private List<Project> created;
    private List<Project> updated;

    @BeforeEach
    void setUp() {
        service = new ProjectBizServiceImpl();
        userProjects = new HashMap<>();
        created = new ArrayList<>();
        updated = new ArrayList<>();

        Map<String, Proxies.Invocation> domain = new HashMap<>();
        domain.put("getUserProjects", args -> userProjects.get(args[0]));
        domain.put("createProject", args -> {
            Project p = (Project) args[0];
            p.setId(1L);
            created.add(p);
            return p;
        });
        domain.put("updateProject", args -> {
            Project p = (Project) args[0];
            updated.add(p);
            return p;
        });
        domain.put("archiveProject", args -> true);
        domain.put("isProjectMember", args -> true);
        Proxies.inject(service, "projectDomainService",
                Proxies.of(IProjectDomainService.class, domain));
    }

    private Project project(String name) {
        Project p = new Project();
        p.setName(name);
        p.setDescription("desc-" + name);
        p.setOwnerId(USER);
        return p;
    }

    // ========== listByUser ==========

    @Test
    void listByUser_domainReturnsNull_returnsEmptyList() {
        // 回归守护: domain 层 null (MyBatis 空结果) → 空集合, 不允许 NPE
        List<ProjectDTO> out = service.listByUser(USER);
        assertNotNull(out);
        assertTrue(out.isEmpty());
    }

    @Test
    void listByUser_domainReturnsEmpty_returnsEmptyList() {
        userProjects.put(USER, new ArrayList<>());

        List<ProjectDTO> out = service.listByUser(USER);
        assertNotNull(out);
        assertTrue(out.isEmpty());
    }

    @Test
    void listByUser_mapsEntityToDto() {
        List<Project> src = new ArrayList<>();
        src.add(project("alpha"));
        userProjects.put(USER, src);

        List<ProjectDTO> out = service.listByUser(USER);

        assertEquals(1, out.size());
        assertEquals("alpha", out.get(0).getName());
        assertEquals("desc-alpha", out.get(0).getDescription());
        assertEquals(USER, out.get(0).getOwnerId());
    }

    // ========== create / update / archive / isMember 委托 ==========

    @Test
    void create_delegatesToDomainAndMapsBack() {
        ProjectDTO dto = new ProjectDTO();
        dto.setName("beta");

        ProjectDTO out = service.create(dto, USER);

        assertEquals(1, created.size());
        assertEquals("beta", out.getName());
        assertNotNull(out.getId());
    }

    @Test
    void update_delegatesToDomain() {
        ProjectDTO dto = new ProjectDTO();
        dto.setName("gamma");
        dto.setId(9L);

        ProjectDTO out = service.update(dto, USER);

        assertEquals(1, updated.size());
        assertEquals(9L, updated.get(0).getId());
        assertEquals("gamma", out.getName());
    }
}
