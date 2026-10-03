package com.zifang.z.task.starter.host;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * 宿主侧胶水装配 (2026-10-03 自 z-opc main-starter 平移):
 * E2ESqlMigrationRunner (启动时自执行 SQL 修复脚本).
 *
 * <p>跟随 z.task.host.enabled 开关 (默认关): 寄生 all-in-one 模式由宿主打开,
 * standalone 分布式模式不开 (数据库由独立 z-task 容器初始化, 不需要宿主跑 SQL).
 */
@Configuration
@ConditionalOnProperty(prefix = "z.task.host", name = "enabled", havingValue = "true", matchIfMissing = false)
@ComponentScan(basePackages = "com.zifang.z.task.starter.host")
public class TaskHostAutoConfiguration {
}