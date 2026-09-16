package com.zifang.z.task.web.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FullyQualifiedAnnotationBeanNameGenerator;

/**
 * z-task Web 模块自动配置入口
 */
@Configuration
@ComponentScan(
        basePackages = {
                "com.zifang.z.task.web",
                "com.zifang.z.task.core.service",
                "com.zifang.z.task.core.service.impl",
                "com.zifang.z.task.core.domain.service",
                "com.zifang.z.task.core.domain.service.impl"
        },
        nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class
)
public class ZTaskWebAutoConfiguration {
}
