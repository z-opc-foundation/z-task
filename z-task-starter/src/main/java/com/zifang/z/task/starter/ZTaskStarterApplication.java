package com.zifang.z.task.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Z-Task 任务管理平台启动类
 * <p>
 * 只扫描本包 (WebMvcConfig); 业务组件由 z-task-web 的 ZTaskWebAutoConfiguration
 * 通过 META-INF/spring.factories 统一注册 (FQCN bean 名), 避免双扫描导致
 * NoUniqueBeanDefinitionException。
 */
@SpringBootApplication
public class ZTaskStarterApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZTaskStarterApplication.class, args);
    }
}
