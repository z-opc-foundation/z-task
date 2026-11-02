package com.zifang.z.task.core.service;

import com.zifang.z.task.core.config.TaskWorkspaceProperties;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * 待办项目「项目空间」文件服务：把「一个项目 = 服务器上一个文件夹」做实。
 *
 * <h3>目录约定</h3>
 * <pre>
 * {z-task.workspace.base-dir}/todo/{projectId}/     ← 项目空间根
 *   ├── 需求.md
 *   ├── 调研/
 *   │   └── 竞品.md
 *   └── 产出/
 * </pre>
 * 目录名由 {@code projectId} <b>确定性推导</b>，不落库、不建列：一旦落列就有「列 vs 目录」
 * 两个真相源，项目迁移/改名时必然分叉。
 *
 * <h3>为什么读写在服务层而不是直接给 Agent 文件工具</h3>
 * 个人 Agent 有自己的工作区（草稿/记忆/skills），不是任何一个项目的空间。若不额外收口，
 * 让模型拿 {@code write_file} 自由写，路径可以穿到别的项目甚至 {@code .env}。
 * ⇒ 项目空间的读写一律走本服务，由这里做<b>沙箱归一 + 越界拒绝 + 体积上限</b>。
 *
 * <h3>安全边界（全部是硬拒绝，不是"尽量"）</h3>
 * <ul>
 *   <li>绝对路径拒绝：{@code /etc/passwd} 不会 resolve 到根之外</li>
 *   <li>{@code ..} 段拒绝：{@code ../../agents} 穿不出去</li>
 *   <li>最终路径必须 {@code startsWith(root)}；符号链接目标同样校验</li>
 *   <li>单文件读 1MB / 写 2MB 上限；目录树 1000 条上限（防一次 tree 把上下文打爆）</li>
 * </ul>
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code TeamTodoSpaceService}）。安全边界常量与
 * 行为**逐字保留**，只把配置源从 {@code TeamWorkspaceProperties} 换成
 * {@link TaskWorkspaceProperties}。
 *
 * @author z-task
 * @since 1.0.0
 */
@Service("zTaskTodoSpaceService")
public class TodoSpaceService {

    /** 单次读取上限：超过即拒绝，防止把大二进制塞进模型上下文。 */
    public static final long MAX_READ_BYTES = 1024L * 1024L;

    /** 单次写入上限。 */
    public static final long MAX_WRITE_BYTES = 2L * 1024L * 1024L;

    /** 目录树条目上限。 */
    public static final int MAX_TREE_ENTRIES = 1000;

    private static final Logger log = LogManager.getLogger(TodoSpaceService.class);

    private static final String TODO_SPACE_DIR = "todo";

    @Resource
    private TaskWorkspaceProperties workspaceProperties;

    public TodoSpaceService() {
    }

    /** 便于单测注入配置（生产走 {@code @Resource} 字段注入）。 */
    public TodoSpaceService(TaskWorkspaceProperties workspaceProperties) {
        this.workspaceProperties = workspaceProperties;
    }

    /* ────────────────────────── 路径 ────────────────────────── */

    /**
     * 项目空间根目录 {@code {base-dir}/todo/{projectId}}，不存在则创建。
     *
     * @param projectId 待办项目 id
     * @return 规范化的绝对路径
     */
    public Path resolveRoot(Long projectId) {
        if (projectId == null || projectId <= 0) {
            throw new IllegalArgumentException("项目 id 不能为空");
        }
        if (workspaceProperties == null) {
            throw new IllegalStateException("工作区配置缺失，无法解析项目空间目录");
        }
        Path base = Paths.get(workspaceProperties.getBaseDir()).toAbsolutePath().normalize();
        Path root = base.resolve(TODO_SPACE_DIR).resolve(String.valueOf(projectId)).normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("项目空间目录创建失败: " + root, e);
        }
        return root;
    }

    /**
     * 把相对路径收口到项目空间内；任何越界写法直接抛 {@link IllegalArgumentException}。
     *
     * @param projectId 待办项目 id
     * @param relPath   相对路径（空串/null = 根）
     * @return 沙箱内的绝对路径（未创建）
     */
    public Path resolveSafe(Long projectId, String relPath) {
        Path root = resolveRoot(projectId);
        String rel = relPath == null ? "" : relPath.trim().replace('\\', '/');
        if (rel.isEmpty() || ".".equals(rel)) {
            return root;
        }
        if (rel.startsWith("/")) {
            throw new IllegalArgumentException("只接受项目空间内的相对路径，拒绝绝对路径: " + relPath);
        }
        for (String seg : rel.split("/")) {
            if ("..".equals(seg)) {
                throw new IllegalArgumentException("路径不能包含 ..（禁止越出项目空间）: " + relPath);
            }
        }
        Path target = root.resolve(rel).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("路径越出项目空间: " + relPath);
        }
        // 符号链接：指向空间外的链接一律拒绝（否则可借链接读任意文件）
        if (Files.exists(target, LinkOption.NOFOLLOW_LINKS) && Files.isSymbolicLink(target)) {
            throw new IllegalArgumentException("不支持操作符号链接: " + relPath);
        }
        return target;
    }

    /** 相对根路径展示用（统一 / 分隔）。 */
    public String relativize(Long projectId, Path target) {
        Path root = resolveRoot(projectId);
        return root.relativize(target).toString().replace('\\', '/');
    }

    /* ────────────────────────── 读 ────────────────────────── */

    /**
     * 列目录树（深度优先，目录在前，按名称排序）。
     *
     * @param projectId 项目 id
     * @param maxDepth  最大深度（1 = 只看根下第一层）
     * @return 条目列表，每项 {@code {path, name, dir, size}}
     */
    public List<Map<String, Object>> tree(Long projectId, int maxDepth) {
        Path root = resolveRoot(projectId);
        int depth = maxDepth <= 0 ? 3 : Math.min(maxDepth, 6);
        List<Map<String, Object>> out = new ArrayList<>();
        if (!Files.isDirectory(root)) {
            return out;
        }
        walk(root, root, 1, depth, out);
        return out;
    }

    private void walk(Path root, Path dir, int level, int maxDepth, List<Map<String, Object>> out) {
        if (level > maxDepth || out.size() >= MAX_TREE_ENTRIES) {
            return;
        }
        List<Path> children;
        try (Stream<Path> s = Files.list(dir)) {
            children = new ArrayList<>();
            s.forEach(children::add);
        } catch (IOException e) {
            log.warn("[todo-space] 列目录失败 {}: {}", dir, e.getMessage());
            return;
        }
        children.sort(Comparator
                .comparing((Path p) -> !Files.isDirectory(p))
                .thenComparing(p -> p.getFileName().toString()));
        for (Path child : children) {
            if (out.size() >= MAX_TREE_ENTRIES) {
                return;
            }
            String name = child.getFileName().toString();
            if (name.startsWith(".")) {
                continue;
            }
            boolean isDir = Files.isDirectory(child, LinkOption.NOFOLLOW_LINKS);
            Map<String, Object> node = new LinkedHashMap<>();
            node.put("path", root.relativize(child).toString().replace('\\', '/'));
            node.put("name", name);
            node.put("dir", isDir);
            node.put("size", isDir ? 0L : sizeOf(child));
            out.add(node);
            if (isDir) {
                walk(root, child, level + 1, maxDepth, out);
            }
        }
    }

    private long sizeOf(Path p) {
        try {
            return Files.size(p);
        } catch (IOException e) {
            return 0L;
        }
    }

    /**
     * 读文本文件（UTF-8）。
     *
     * @throws IllegalArgumentException 文件不存在 / 超出体积 / 看起来是二进制
     */
    public String read(Long projectId, String relPath) {
        Path target = resolveSafe(projectId, relPath);
        if (!Files.exists(target)) {
            throw new IllegalArgumentException("文件不存在: " + relPath);
        }
        if (Files.isDirectory(target)) {
            throw new IllegalArgumentException("这是一个目录，不能当文件读: " + relPath);
        }
        long size = sizeOf(target);
        if (size > MAX_READ_BYTES) {
            throw new IllegalArgumentException("文件超过 " + (MAX_READ_BYTES / 1024) + "KB，拒绝读取: "
                    + relPath + "（" + size + " bytes）");
        }
        byte[] bytes;
        try {
            bytes = Files.readAllBytes(target);
        } catch (IOException e) {
            throw new UncheckedIOException("读文件失败: " + relPath, e);
        }
        if (looksBinary(bytes)) {
            throw new IllegalArgumentException("疑似二进制文件，不支持按文本读取: " + relPath);
        }
        return new String(bytes, StandardCharsets.UTF_8);
    }

    /** 前 512 字节含 NUL 即判定为二进制。 */
    private boolean looksBinary(byte[] bytes) {
        int n = Math.min(bytes.length, 512);
        for (int i = 0; i < n; i++) {
            if (bytes[i] == 0) {
                return true;
            }
        }
        return false;
    }

    /* ────────────────────────── 写 ────────────────────────── */

    /**
     * 写文本文件（自动创建父目录）。
     *
     * @param append true=追加，false=覆盖
     * @return 写入后的相对路径
     */
    public String write(Long projectId, String relPath, String content, boolean append) {
        String text = content == null ? "" : content;
        long bytes = text.getBytes(StandardCharsets.UTF_8).length;
        if (bytes > MAX_WRITE_BYTES) {
            throw new IllegalArgumentException("内容超过 " + (MAX_WRITE_BYTES / 1024 / 1024) + "MB，拒绝写入");
        }
        Path target = resolveSafe(projectId, relPath);
        if (Files.isDirectory(target)) {
            throw new IllegalArgumentException("目标是目录，不能当文件写: " + relPath);
        }
        Path parent = target.getParent();
        try {
            if (parent != null) {
                Files.createDirectories(parent);
            }
            StandardOpenOption[] options = append
                    ? new StandardOpenOption[]{StandardOpenOption.CREATE, StandardOpenOption.APPEND}
                    : new StandardOpenOption[]{StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING};
            Files.write(target, text.getBytes(StandardCharsets.UTF_8), options);
        } catch (IOException e) {
            throw new UncheckedIOException("写文件失败: " + relPath, e);
        }
        return relativize(projectId, target);
    }

    /** 建目录（递归）。返回相对路径。 */
    public String mkdir(Long projectId, String relPath) {
        Path target = resolveSafe(projectId, relPath);
        try {
            Files.createDirectories(target);
        } catch (IOException e) {
            throw new UncheckedIOException("建目录失败: " + relPath, e);
        }
        return relativize(projectId, target);
    }

    /** 删除文件/空目录（不做递归删除，防一手误删整棵树）。 */
    public boolean delete(Long projectId, String relPath) {
        Path target = resolveSafe(projectId, relPath);
        if (target.equals(resolveRoot(projectId))) {
            throw new IllegalArgumentException("不能删除项目空间根目录");
        }
        if (!Files.exists(target)) {
            return false;
        }
        try {
            Files.delete(target);
            return true;
        } catch (IOException e) {
            throw new UncheckedIOException("删除失败（目录非空？）: " + relPath, e);
        }
    }

    /* ────────────────────────── 检索 ────────────────────────── */

    /**
     * 按关键字检索：先匹配文件名，再匹配文本内容（单文件 ≤ {@link #MAX_READ_BYTES}）。
     *
     * @param keyword 关键字（大小写不敏感）
     * @param maxHits 命中上限
     * @return 命中项 {@code {path, name, hit: name|content, snippet}}
     */
    public List<Map<String, Object>> search(Long projectId, String keyword, int maxHits) {
        String kw = keyword == null ? "" : keyword.trim().toLowerCase();
        List<Map<String, Object>> out = new ArrayList<>();
        if (kw.isEmpty()) {
            return out;
        }
        int limit = maxHits <= 0 ? 20 : Math.min(maxHits, 100);
        for (Map<String, Object> node : tree(projectId, 6)) {
            if (out.size() >= limit) {
                break;
            }
            boolean isDir = Boolean.TRUE.equals(node.get("dir"));
            String path = String.valueOf(node.get("path"));
            String name = String.valueOf(node.get("name"));
            if (name.toLowerCase().contains(kw)) {
                Map<String, Object> hit = new LinkedHashMap<>(node);
                hit.put("hit", "name");
                hit.put("snippet", "");
                out.add(hit);
                continue;
            }
            if (isDir) {
                continue;
            }
            String content;
            try {
                content = read(projectId, path);
            } catch (RuntimeException e) {
                continue;
            }
            String lower = content.toLowerCase();
            int idx = lower.indexOf(kw);
            if (idx >= 0) {
                int from = Math.max(0, idx - 40);
                int to = Math.min(content.length(), idx + kw.length() + 60);
                Map<String, Object> hit = new LinkedHashMap<>(node);
                hit.put("hit", "content");
                hit.put("snippet", content.substring(from, to).replace('\n', ' '));
                out.add(hit);
            }
        }
        return out;
    }
}
