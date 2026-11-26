package com.zifang.z.task.admin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 配置静态资源
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 静态资源映射
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    /**
     * 配置视图控制器，支持前端路由history模式.
     * <p>
     * Spring Boot 2.7 默认 PathPatternParser 不允许 `/**` 后再跟模式段,
     * 故按有限深度枚举非资源路径段; 含 `.` 的路径(静态资源)不转发.
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{p1:[^\\.]+}").setViewName("forward:/index.html");
        registry.addViewController("/{p1:[^\\.]+}/{p2:[^\\.]+}").setViewName("forward:/index.html");
        registry.addViewController("/{p1:[^\\.]+}/{p2:[^\\.]+}/{p3:[^\\.]+}").setViewName("forward:/index.html");
    }
}
