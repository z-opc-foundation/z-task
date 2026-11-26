package com.zifang.z.task.core.config;

import com.zifang.z.boot.datasource.starter.AuditMetaObjectHandler;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * z-task 域的 MyBatis-Plus {@code MetaObjectHandler} 实现。
 *
 * <p>背景：z-boot 的 {@link AuditMetaObjectHandler} 是**抽象基类**，只提供
 * {@code createTime}/{@code updateTime} 的填充逻辑，必须有 concrete 子类被注册成 Spring bean，
 * MyBatis-Plus 才会自动发现并应用。
 *
 * <p>⚠ **为什么 z-task 原本没有它是个隐患**：本仓 {@code application.yml} 排除了
 * {@code MybatisPlusAutoConfiguration}，而 {@code TaskMyBatisConfig} 也没有手工注入
 * GlobalConfig ⇒ 没有 handler ⇒ {@code create_time} 不会被填充。
 * 现有的 z-task 实体（Project/Task 等）大多不继承 {@code AuditDO}，用不到审计字段，
 * 所以一直没暴露；待办两表继承了审计基类且 {@code create_time} 是 {@code NOT NULL}
 * ⇒ 不补这个类，待办插入会直接报
 * {@code Column 'create_time' cannot be null}。
 *
 * <p>{@code @Primary} 是为了避免与 z-oss-api 引入的 {@code OssMybatisPlusConfig}
 * 同时实现 {@code MetaObjectHandler} 导致 {@code NoUniqueBeanDefinitionException}。
 *
 * <p>2026-11-02 随待办能力迁入新增。
 *
 * @author z-task
 */
@Primary
@Component
public class ZTaskAuditMetaObjectHandler extends AuditMetaObjectHandler {
}
