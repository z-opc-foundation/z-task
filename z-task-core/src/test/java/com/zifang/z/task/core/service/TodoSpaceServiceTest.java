package com.zifang.z.task.core.service;

import com.zifang.z.task.core.config.TaskWorkspaceProperties;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 项目空间沙箱口径。
 *
 * <p>这套断言钉的是<b>安全边界</b>而不是普通功能：项目空间会被 Agent 自主写入，
 * 一旦越界（{@code ..} / 绝对路径 / 符号链接）就意味着模型能读写别的项目甚至系统文件。
 * 所以每条越界写法都必须<b>抛异常拒绝</b>，不能"尽力而为"。
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code TeamTodoSpaceServiceTest}）。
 * 自 z-team 迁到 z-task 后，<b>项目空间的真实实现在本仓</b> ——
 * 沙箱边界必须在这里被钉住，不能只测转发。
 */
class TodoSpaceServiceTest {

    private Path baseDir;
    private TodoSpaceService service;

    private static final long PROJECT_ID = 1001L;

    @BeforeEach
    void setUp() throws IOException {
        baseDir = Files.createTempDirectory("z-task-todo-space-");
        TaskWorkspaceProperties props = new TaskWorkspaceProperties();
        props.setBaseDir(baseDir.toString());
        service = new TodoSpaceService(props);
    }

    @AfterEach
    void tearDown() throws IOException {
        if (baseDir == null || !Files.exists(baseDir)) {
            return;
        }
        try (Stream<Path> walk = Files.walk(baseDir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                    // 清理失败不影响断言
                }
            });
        }
    }

    @Test
    void 根目录落在_base_todo_projectId_下且自动创建() {
        Path root = service.resolveRoot(PROJECT_ID);
        assertTrue(Files.isDirectory(root), "根目录应被自动创建");
        assertTrue(root.endsWith(Path.of("todo", String.valueOf(PROJECT_ID))),
                "目录必须是 {base}/todo/{projectId}，实际：" + root);
        assertTrue(root.startsWith(baseDir.toAbsolutePath().normalize()));
    }

    @Test
    void 写入后能读回且父目录自动创建() {
        service.write(PROJECT_ID, "调研/竞品.md", "竞品 A 定价 99\n", false);
        assertEquals("竞品 A 定价 99\n", service.read(PROJECT_ID, "调研/竞品.md"));
    }

    @Test
    void append_模式累加而不是覆盖() {
        service.write(PROJECT_ID, "日志.md", "第一行\n", false);
        service.write(PROJECT_ID, "日志.md", "第二行\n", true);
        assertEquals("第一行\n第二行\n", service.read(PROJECT_ID, "日志.md"));
    }

    @Test
    void 拒绝用点点逃出项目空间() {
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.write(PROJECT_ID, "../../agents/evil.md", "x", false));
        assertTrue(e.getMessage().contains(".."), "应明确拒绝 .. 段，实际：" + e.getMessage());
        assertFalse(Files.exists(baseDir.resolve("agents").resolve("evil.md")));
    }

    @Test
    void 拒绝绝对路径() {
        assertThrows(IllegalArgumentException.class,
                () -> service.read(PROJECT_ID, "/etc/passwd"));
    }

    @Test
    void 拒绝删除项目空间根目录() {
        assertThrows(IllegalArgumentException.class, () -> service.delete(PROJECT_ID, ""));
    }

    @Test
    void 目录树按目录优先列出嵌套结构() {
        service.write(PROJECT_ID, "需求.md", "需求正文", false);
        service.write(PROJECT_ID, "调研/竞品.md", "竞品", false);
        service.write(PROJECT_ID, "调研/用户/访谈.md", "访谈", false);

        List<Map<String, Object>> tree = service.tree(PROJECT_ID, 4);
        List<String> paths = tree.stream().map(m -> String.valueOf(m.get("path"))).toList();

        assertTrue(paths.contains("需求.md"), "应含顶层文件：" + paths);
        assertTrue(paths.contains("调研"), "应含目录本身：" + paths);
        assertTrue(paths.contains("调研/竞品.md"), "应含嵌套文件：" + paths);
        assertTrue(paths.contains("调研/用户/访谈.md"), "应含更深层文件：" + paths);
        // 目录排在文件之前
        assertTrue(paths.indexOf("调研") < paths.indexOf("需求.md"), "目录应先于文件：" + paths);
    }

    @Test
    void depth_到顶就停() {
        service.write(PROJECT_ID, "a/b/c/deep.md", "x", false);
        List<String> paths = service.tree(PROJECT_ID, 2).stream()
                .map(m -> String.valueOf(m.get("path"))).toList();
        assertTrue(paths.contains("a/b"), "第 2 层应列出：" + paths);
        assertFalse(paths.contains("a/b/c"), "第 3 层不应列出：" + paths);
    }

    @Test
    void 检索能命中文件名也能命中正文() {
        service.write(PROJECT_ID, "竞品分析.md", "这里没有关键字", false);
        service.write(PROJECT_ID, "杂项.md", "定价策略：竞品 A 卖 99", false);

        List<Map<String, Object>> hits = service.search(PROJECT_ID, "竞品", 10);
        assertTrue(hits.size() >= 2, "文件名与正文各应命中一条，实际：" + hits);
        assertTrue(hits.stream().anyMatch(h -> "name".equals(h.get("hit"))));
        assertTrue(hits.stream().anyMatch(h -> "content".equals(h.get("hit"))));
    }

    @Test
    void 二进制文件拒绝按文本读取() throws IOException {
        Path root = service.resolveRoot(PROJECT_ID);
        Files.write(root.resolve("blob.bin"), new byte[]{1, 2, 0, 3, 4});

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> service.read(PROJECT_ID, "blob.bin"));
        assertTrue(e.getMessage().contains("二进制"), "应提示二进制不可读，实际：" + e.getMessage());
    }

    @Test
    void 超限内容拒绝写入() {
        String huge = "x".repeat((int) TodoSpaceService.MAX_WRITE_BYTES + 1);
        assertThrows(IllegalArgumentException.class,
                () -> service.write(PROJECT_ID, "big.md", huge, false));
    }

    @Test
    void 文件内容按_utf8_往返不丢中文() {
        String text = "中文内容 · emoji 🚀 · end";
        service.write(PROJECT_ID, "utf8.md", text, false);
        Path p = service.resolveRoot(PROJECT_ID).resolve("utf8.md");
        try {
            assertEquals(text, new String(Files.readAllBytes(p), StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new AssertionError(e);
        }
    }

    @Test
    void 建目录后可列出该目录() {
        String created = service.mkdir(PROJECT_ID, "产出/周报");
        assertEquals("产出/周报", created);
        List<String> paths = service.tree(PROJECT_ID, 3).stream()
                .map(m -> String.valueOf(m.get("path"))).toList();
        assertTrue(paths.contains("产出"), "应列出新建目录：" + paths);
    }

    @Test
    void 删除文件后读不到() {
        service.write(PROJECT_ID, "临时.md", "x", false);
        assertTrue(service.delete(PROJECT_ID, "临时.md"));
        assertThrows(IllegalArgumentException.class,
                () -> service.read(PROJECT_ID, "临时.md"));
    }
}
