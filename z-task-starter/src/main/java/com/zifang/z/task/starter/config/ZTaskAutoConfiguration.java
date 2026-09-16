package com.zifang.z.task.starter.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Z-Task Spring Boot 自动配置类
 */
@Configuration
@ComponentScan(basePackages = {
        "com.zifang.z.task.starter.controller",
        "com.zifang.z.task.starter.handler",
        "com.zifang.z.task.starter.job",
        "com.zifang.z.task.starter.aop",
        "com.zifang.z.task.starter.interceptor",
        "com.zifang.z.task.starter.resolver",
        "com.zifang.z.task.core.service"
})
public class ZTaskAutoConfiguration {
}
