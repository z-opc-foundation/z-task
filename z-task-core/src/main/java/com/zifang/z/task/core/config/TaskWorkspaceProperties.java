package com.zifang.z.task.core.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 工作区根目录（{@code z-task.workspace}）。
 *
 * <p>待办的「项目空间」= 「一个项目 = 服务器上一个文件夹」，落在
 * {@code {base-dir}/todo/{projectId}/}。
 *
 * <h3>⚠ 与 z-team 的 base-dir 必须指向同一物理目录</h3>
 * 目录名由 {@code projectId} 确定性推导（不落库、不建列），所以只要两边 base-dir 一致，
 * <b>存量项目空间文件零迁移、零丢失</b>；一旦分叉就会变成两份互不相干的目录。
 *
 * <p>迁移期间 z-team 与 z-task 指向同一目录；待办完全落到 z-task 后，
 * 这一格可以独占（此时再迁目录也不影响数据）。
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code TeamWorkspaceProperties}）。
 * 只取待办需要的 {@code base-dir} 一项，其余 groups/agents/knowledge/pipeline
 * 子目录归 z-team 自己管，不搬。
 *
 * @author z-task
 */
@ConfigurationProperties(prefix = "z-task.workspace")
public class TaskWorkspaceProperties {

    private static final Logger log = LogManager.getLogger(TaskWorkspaceProperties.class);

    /**
     * 自定义根路径；留空则用 {@link #defaultBaseDir()}。
     */
    private String baseDir;

    /**
     * 是否为本地开发模式（沿用 z-team 的 env 口径）。
     */
    @Value("${z-task.workspace.env:prod}")
    private String env = "prod";

    /**
     * 工作区根目录默认值：{@code ${user.home}/z_team}。
     *
     * <p>与 z-team 的默认值**逐字相同** —— 这是「存量文件不丢」的前提：
     * 两侧都跑在同一个 uid 下、都没配 base-dir 时，落到同一个家目录。
     */
    public static String defaultBaseDir() {
        return System.getProperty("user.home") + "/z_team";
    }

    public TaskWorkspaceProperties() {
    }

    /**
     * 便于单测注入配置（生产走 {@code @ConfigurationProperties} 绑定）。
     */
    public TaskWorkspaceProperties(String baseDir) {
        this.baseDir = baseDir;
    }

    /**
     * 启动时确保 base-dir 存在，并在日志里打印实际落点。
     *
     * <p>打印实际路径是有意为之：两仓 base-dir 不一致是本迁移唯一的运维硬约束，
     * 启动日志是最早能发现分叉的地方。
     */
    @PostConstruct
    public void ensureBaseDirOnStartup() {
        try {
            Path base = Paths.get(getBaseDir()).toAbsolutePath().normalize();
            Files.createDirectories(base);
            log.info("[task-workspace] base dir ready: {}", base);
        } catch (Exception e) {
            // 预创建失败不应该阻止服务启动 —— 后续 lazy mkdir 会再试
            log.warn("[task-workspace] ensure base dir failed (lazy mkdir will retry on demand): {}",
                    e.toString());
        }
    }

    public String getBaseDir() {
        if (baseDir != null && !baseDir.trim().isEmpty()) {
            return baseDir.trim();
        }
        return defaultBaseDir();
    }

    public void setBaseDir(String baseDir) {
        this.baseDir = baseDir;
    }

    public String getEnv() {
        return env;
    }

    public void setEnv(String env) {
        this.env = env;
    }

    public boolean isLocal() {
        return "local".equalsIgnoreCase(env);
    }
}
