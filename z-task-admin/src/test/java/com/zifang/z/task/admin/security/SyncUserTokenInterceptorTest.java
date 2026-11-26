package com.zifang.z.task.admin.security;

import com.zifang.z.task.web.security.SyncUserTokenInterceptor;
import com.zifang.z.task.web.security.SyncUserWebMvcConfig;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.handler.MappedInterceptor;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * /api/sync-user/** 专用 token 闸门：四种鉴权场景 + 注册契约。
 *
 * <p>闸门实现在 z-task-web，本测试放启动模块 z-task-admin（依赖 web）执行：
 * 零 Mockito、零 Spring 上下文，直接构造拦截器/请求（沿用本仓 core 测试的家法）。
 */
class SyncUserTokenInterceptorTest {

    private static final String TOKEN = "unit-test-token-value";
    private static final String HEADER = SyncUserTokenInterceptor.TOKEN_HEADER;

    private static MockHttpServletRequest postSync() {
        return new MockHttpServletRequest("POST", "/api/sync-user/sync");
    }

    @Test
    void 无token返回401() throws Exception {
        SyncUserTokenInterceptor interceptor = new SyncUserTokenInterceptor(TOKEN);
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertFalse(interceptor.preHandle(postSync(), response, new Object()));
        assertEquals(401, response.getStatus());
    }

    @Test
    void 错token返回401() throws Exception {
        SyncUserTokenInterceptor interceptor = new SyncUserTokenInterceptor(TOKEN);
        MockHttpServletRequest request = postSync();
        request.addHeader(HEADER, "wrong-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertFalse(interceptor.preHandle(request, response, new Object()));
        assertEquals(401, response.getStatus());
    }

    @Test
    void 未配置token时即使带正确header也一律401() throws Exception {
        // fail-closed 的核心：token 未注入（null / 空 / 全空白）⇒ 端点必须拒绝，绝不静默放行。
        for (String unconfigured : new String[]{null, "", "   "}) {
            SyncUserTokenInterceptor interceptor = new SyncUserTokenInterceptor(unconfigured);
            MockHttpServletRequest request = postSync();
            request.addHeader(HEADER, TOKEN);
            MockHttpServletResponse response = new MockHttpServletResponse();

            assertFalse(interceptor.preHandle(request, response, new Object()));
            assertEquals(401, response.getStatus());
        }
    }

    @Test
    void 正确token放行() throws Exception {
        SyncUserTokenInterceptor interceptor = new SyncUserTokenInterceptor(TOKEN);
        MockHttpServletRequest request = postSync();
        request.addHeader(HEADER, TOKEN);
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertTrue(interceptor.preHandle(request, response, new Object()));
        assertNotEquals(401, response.getStatus());
    }

    @Test
    void 拒绝响应不回显token值() throws Exception {
        SyncUserTokenInterceptor interceptor = new SyncUserTokenInterceptor(TOKEN);
        MockHttpServletRequest request = postSync();
        request.addHeader(HEADER, "wrong-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        interceptor.preHandle(request, response, new Object());
        assertFalse(response.getContentAsString().contains(TOKEN));
        assertFalse(response.getContentAsString().contains("wrong-token"));
    }

    @Test
    void 配置类把拦截器注册到syncUser路径() {
        // 证明生产配置类确实把闸门挂到 /api/sync-user 与 /api/sync-user/**，
        // 而不是「类存在却没注册」导致裸奔。
        SyncUserWebMvcConfig config = new SyncUserWebMvcConfig(TOKEN);
        ExposedRegistry registry = new ExposedRegistry();
        config.addInterceptors(registry);

        List<Object> mapped = registry.interceptors();
        assertEquals(1, mapped.size());
        assertTrue(mapped.get(0) instanceof MappedInterceptor);
        MappedInterceptor mi = (MappedInterceptor) mapped.get(0);
        assertTrue(mi.getInterceptor() instanceof SyncUserTokenInterceptor);
        // InterceptorRegistry 以 MappedInterceptor(includePatterns, excludePatterns, interceptor) 构造，
        // addPathPatterns 的两个 pattern 落在 getIncludePathPatterns() 里。
        List<String> patterns = Arrays.asList(mi.getIncludePathPatterns());
        assertTrue(patterns.contains("/api/sync-user"));
        assertTrue(patterns.contains("/api/sync-user/**"));
    }

    /** {@code InterceptorRegistry#getInterceptors()} 是 protected，用子类暴露给断言。 */
    private static class ExposedRegistry extends InterceptorRegistry {
        List<Object> interceptors() {
            return super.getInterceptors();
        }
    }
}
