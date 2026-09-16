package com.zifang.z.task.starter.config;

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
     * 配置视图控制器，支持前端路由history模式
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 所有非/api开头的请求都转发到index.html，交给前端路由处理
        registry.addViewController("/{path:[^api].*}")
                .setViewName("forward:/index.html");
        // 处理多级路由
        registry.addViewController("/**/{path:[^\\.]+}")
                .setViewName("forward:/index.html");
    }
}
