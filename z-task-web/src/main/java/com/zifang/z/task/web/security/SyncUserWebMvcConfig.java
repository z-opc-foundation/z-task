package com.zifang.z.task.web.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 注册 {@link SyncUserTokenInterceptor}，只作用于 {@code /api/sync-user/**}。
 *
 * <p>本类位于 {@code com.zifang.z.task.web} 包下，由 {@code ZTaskWebAutoConfiguration}
 * 的 {@code @ComponentScan} 装配（该自动配置经 {@code AutoConfiguration.imports} 生效）
 * ⇒ 拦截器随 web 模块一定注册，是 fail-closed 的一环：不会出现「拦截器没注册就裸奔」。
 *
 * <p>order 取 {@link Ordered#HIGHEST_PRECEDENCE}：用户同步端点标注 {@link NoLogin}
 * 放行用户 SSO 闸门，本拦截器必须在 SSO 拦截器之前独立完成 service token 校验，
 * token 不合法直接 401 短路，不落到 Controller。
 */
@Configuration
public class SyncUserWebMvcConfig implements WebMvcConfigurer {

    private final SyncUserTokenInterceptor syncUserTokenInterceptor;

    public SyncUserWebMvcConfig(@Value("${z-task.sync-user.token:}") String token) {
        this.syncUserTokenInterceptor = new SyncUserTokenInterceptor(token);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(syncUserTokenInterceptor)
                // 显式列两个 pattern：GET /api/sync-user?userId= 与 POST /api/sync-user/sync 都覆盖。
                .addPathPatterns("/api/sync-user", "/api/sync-user/**")
                .order(Ordered.HIGHEST_PRECEDENCE);
    }
}
