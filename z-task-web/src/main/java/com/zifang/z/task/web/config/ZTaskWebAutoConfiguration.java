package com.zifang.z.task.web.config;

import com.zifang.z.task.core.config.TaskWorkspaceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FullyQualifiedAnnotationBeanNameGenerator;

/**
 * z-task Web 模块自动配置入口。
 *
 * <p>⚠ {@code @ComponentScan} 白名单是**逐包枚举**的：新增 service/config 包必须同步加进来，
 * 漏了表现为 bean 找不到（启动即失败，不会静默）。
 *
 * <p>2026-11-02 随待办能力迁入，新增 {@code com.zifang.z.task.core.config} 一包
 * （{@link TaskWorkspaceProperties} —— 待办项目空间的 base-dir）；
 * 同日随待办前端搬迁，新增 {@code com.zifang.z.task.core.integration.team} 一包
 * （{@code RemoteTeamClient} —— 笔记/个人 Agent/员工搜索/群聊场景/图片上传的 z-team 反向代理）。
 */
@Configuration
@ComponentScan(
        basePackages = {
                "com.zifang.z.task.web",
                "com.zifang.z.task.core.config",
                "com.zifang.z.task.core.integration.team",
                "com.zifang.z.task.core.service",
                "com.zifang.z.task.core.service.impl",
                "com.zifang.z.task.core.domain.service",
                "com.zifang.z.task.core.domain.service.impl"
        },
        nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class
)
@EnableConfigurationProperties(TaskWorkspaceProperties.class)
public class ZTaskWebAutoConfiguration {
}
