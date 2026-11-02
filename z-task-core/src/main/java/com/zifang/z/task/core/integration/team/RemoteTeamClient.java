package com.zifang.z.task.core.integration.team;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.Resource;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * z-team 跨域能力的 HTTP 客户端（z-task → z-team）。
 *
 * <h3>为什么需要它</h3>
 * 2026-11-02 起，待办（todo）能力的归属方从 z-team 迁到 <b>z-task</b>，
 * 前端 {@code TodoTab} 也随之搬到 z-task-component。
 * <p>但待办详情里有 5 个能力**不属于待办域**，它们的能力归属方仍是 z-team：
 * <ul>
 *   <li><b>个人笔记</b>（{@code /api/personal-note/**}）—— 笔记树 / 详情 / 收藏 / 分享</li>
 *   <li><b>个人 Agent</b>（{@code /api/personal-agents}）—— 派发目标列表</li>
 *   <li><b>员工搜索</b>（{@code /api/personal-agents/{id}/schedules/staff-search}）—— 指派候选</li>
 *   <li><b>群聊场景</b>（{@code /api/scenario-instances}）—— 事项关联的群聊项目</li>
 *   <li><b>图片上传</b>（{@code /api/common/upload-image}）—— 编辑器插图</li>
 * </ul>
 * z-task 后端**没有**这些 endpoint（实测 {@code z-task-web} 全部 {@code @RequestMapping}
 * 只有 9 个：project / project-member / task / task-list / board / label / task-label /
 * sync-user / todo）⇒ 前端若直接调 z-team 就形成前端跨域调用。
 *
 * <p>⇒ **本类把这 5 类能力代理到 z-team**，让 z-task 前端只需面对
 * {@code /api/todo/cross/**} 一组同源端点。
 * <p>这与「后端 todo 从 z-team 迁到 z-task」是<b>反向</b>的一条链：
 * 待办数据在 z-task，跨域附属能力在 z-team，两边互调。
 *
 * <h3>鉴权透传</h3>
 * z-team 侧端点用 {@code ?token=} 取当前用户（{@code TeamCurrentUserResolver.requireUser(token)}），
 * 本类把 z-task 侧解析出的 userId 原样透传过去。
 * <p>⚠ 这是<b>内部服务间调用</b>：z-team 与 z-task 同集群、可信 ⇒ 走内网地址，不经公网入口。
 *
 * @author z-task
 * @since 1.0.0
 */
@Component
public class RemoteTeamClient {

    private static final Logger log = LogManager.getLogger(RemoteTeamClient.class);

    /**
     * z-util {@code Result} 信封的<b>成功</b>状态码。
     *
     * <p>⚠ 实测值是 <b>200</b>（{@code BaseStatusCode.OK} = 200），<b>不是 0</b>。
     * 早期 z-team 侧的客户端误判成 0 ⇒ 上游返回成功却被当成失败。这里沿用实测口径。
     */
    public static final int CODE_SUCCESS = 200;

    /**
     * z-team 服务地址。
     * <p>默认指向集群内 DNS。z-team 的 context-path 是 {@code /z-team}，
     * 所以 base-url **不含** {@code /z-team}，由各方法自己拼 {@code /api/...}。
     */
    @Value("${z-task.team.base-url:http://z-team-admin.z-team.svc.cluster.local:8080/z-team}")
    private String baseUrl;

    @Resource
    private RestTemplate restTemplate;

    @Resource
    private ObjectMapper objectMapper;

    /* ────────────────────────── 个人笔记 ────────────────────────── */

    /** 笔记树。 */
    public Map<String, Object> noteTree(String userId) {
        return exchange(HttpMethod.GET, "/api/personal-note/tree", null, userId);
    }

    /** 笔记详情。 */
    public Map<String, Object> noteDetail(String userId, String noteId) {
        return exchange(HttpMethod.GET, "/api/personal-note/" + noteId, null, userId);
    }

    /** 更新笔记。 */
    public Map<String, Object> updateNote(String userId, String noteId, Map<String, Object> body) {
        return exchange(HttpMethod.PUT, "/api/personal-note/" + noteId, body, userId);
    }

    /** 收藏夹列表。 */
    public Map<String, Object> noteFavorites(String userId) {
        return exchange(HttpMethod.GET, "/api/personal-note/favorites", null, userId);
    }

    /** 收藏笔记。 */
    public Map<String, Object> favoriteNote(String userId, String noteId) {
        return exchange(HttpMethod.POST, "/api/personal-note/" + noteId + "/favorite", null, userId);
    }

    /** 取消收藏。 */
    public Map<String, Object> unfavoriteNote(String userId, String noteId) {
        return exchange(HttpMethod.DELETE, "/api/personal-note/" + noteId + "/favorite", null, userId);
    }

    /** 分享笔记，返回分享标识。 */
    public Map<String, Object> shareNote(String userId, String noteId) {
        return exchange(HttpMethod.POST, "/api/personal-note/" + noteId + "/share", null, userId);
    }

    /* ────────────────────────── 个人 Agent ────────────────────────── */

    /** 个人 Agent 列表（派发目标）。 */
    public Map<String, Object> personalAgents(String userId) {
        return exchange(HttpMethod.GET, "/api/personal-agents", null, userId);
    }

    /* ────────────────────────── 员工搜索 ────────────────────────── */

    /**
     * 员工目录搜索（指派候选）。
     *
     * @param personalAgentId z-team 侧的个人 Agent id —— 该端点挂在
     *                        {@code /api/personal-agents/{id}/schedules/staff-search} 下，
     *                        前端传 0 表示「不限定 Agent」（z-team 侧该参数只做路径占位）。
     */
    public Map<String, Object> searchStaff(String userId, long personalAgentId, String keyword) {
        String path = "/api/personal-agents/" + personalAgentId + "/schedules/staff-search?keyword="
                + (keyword == null ? "" : java.net.URLEncoder.encode(keyword, StandardCharsets.UTF_8));
        return exchange(HttpMethod.GET, path, null, userId);
    }

    /* ────────────────────────── 群聊场景 ────────────────────────── */

    /** 群聊场景实例列表（事项关联的群聊项目）。 */
    public Map<String, Object> scenarioInstances(String userId, String createTimeStart) {
        StringBuilder path = new StringBuilder("/api/scenario-instances");
        if (createTimeStart != null && !createTimeStart.trim().isEmpty()) {
            path.append("?createTimeStart=")
                    .append(java.net.URLEncoder.encode(createTimeStart, StandardCharsets.UTF_8));
        }
        return exchange(HttpMethod.GET, path.toString(), null, userId);
    }

    /* ────────────────────────── 图片上传 ────────────────────────── */

    /**
     * 上传图片，返回 z-team 给出的可访问地址。
     *
     * @param fileBytes 文件字节
     * @param filename  原始文件名（决定后缀）
     * @param contentType MIME
     */
    public Map<String, Object> uploadImage(String userId, byte[] fileBytes, String filename, String contentType) {
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", new org.springframework.core.io.ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("Accept", "application/json");
        if (userId != null && !userId.isEmpty()) {
            headers.set("X-User-Id", userId);
        }

        ResponseEntity<String> res;
        try {
            res = restTemplate.exchange(baseUrl + "/api/common/upload-image",
                    HttpMethod.POST, new HttpEntity<>(form, headers), String.class);
        } catch (RuntimeException e) {
            throw new IllegalStateException("图片上传失败（z-team 不可达或返回异常）：" + e.getMessage(), e);
        }
        return parseResult(res.getBody());
    }

    /* ────────────────────────── 内部 ────────────────────────── */

    private Map<String, Object> exchange(HttpMethod method, String path, Object body, String userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");
        if (userId != null && !userId.isEmpty()) {
            headers.set("X-User-Id", userId);
        }

        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> res;
        try {
            res = restTemplate.exchange(baseUrl + path, method, entity, String.class);
        } catch (RuntimeException e) {
            log.warn("[z-task→z-team] {} {} 调用失败：{}", method, path, e.getMessage());
            throw new IllegalStateException("z-team 能力不可达（" + method + " " + path + "）：" + e.getMessage(), e);
        }
        return parseResult(res.getBody());
    }

    /**
     * 解 z-util {@code Result} 信封，返回 {@code data}。
     *
     * <p>⚠ 成功码是 <b>200</b>（{@link #CODE_SUCCESS}），不是 0。
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseResult(String body) {
        if (body == null || body.trim().isEmpty()) {
            return new LinkedHashMap<>();
        }
        Map<String, Object> envelope;
        try {
            envelope = objectMapper.readValue(body, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("z-team 返回非 JSON：" + body, e);
        }
        if (envelope == null) {
            return new LinkedHashMap<>();
        }
        Object code = envelope.get("code");
        if (code != null && toInt(code) != CODE_SUCCESS) {
            Object msg = envelope.get("message");
            throw new IllegalArgumentException(msg == null ? "z-team 能力调用失败" : String.valueOf(msg));
        }
        Object data = envelope.get("data");
        if (data instanceof Map) {
            return (Map<String, Object>) data;
        }
        if (data instanceof java.util.List) {
            Map<String, Object> wrapper = new LinkedHashMap<>();
            wrapper.put("items", data);
            return wrapper;
        }
        if (data == null) {
            return new LinkedHashMap<>();
        }
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("value", data);
        return wrapper;
    }

    private static int toInt(Object o) {
        if (o instanceof Number) {
            return ((Number) o).intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(o));
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
