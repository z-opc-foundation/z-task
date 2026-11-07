package com.zifang.z.task.web.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * {@code /api/sync-user/**} 的专用服务端 token 校验（机对机）。
 *
 * <p>该端点是服务间同步用户镜像数据的入口，没有用户 SSO cookie，不能套用用户 SSO 拦截；
 * 但也不能匿名可写，故由本拦截器独立把关：
 * <ul>
 *   <li>token 来自配置 {@code z-task.sync-user.token}（环境变量 {@code ZTASK_SYNC_USER_TOKEN}），
 *       调用方用请求头 {@link #TOKEN_HEADER} 携带；</li>
 *   <li><b>未配置（null / 空白）⇒ 所有请求一律 401</b>（fail-closed，绝不静默放行）；</li>
 *   <li>比对用 {@link MessageDigest#isEqual(byte[], byte[])} 常量时间，避免时序侧信道；</li>
 *   <li>失败返回 401 JSON；不记录、不回显 token 值，也不打印任何日志。</li>
 * </ul>
 */
public class SyncUserTokenInterceptor implements HandlerInterceptor {

    /** 调用方必须携带的请求头名。 */
    public static final String TOKEN_HEADER = "X-ZTask-Sync-Token";

    /** 期望 token 的字节；{@code null} 表示「未配置」⇒ fail-closed。 */
    private final byte[] expectedToken;

    public SyncUserTokenInterceptor(String configuredToken) {
        this.expectedToken = (configuredToken == null || configuredToken.trim().isEmpty())
                ? null
                : configuredToken.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if (expectedToken == null) {
            return reject(response);
        }
        String provided = request.getHeader(TOKEN_HEADER);
        if (provided == null || provided.isEmpty()) {
            return reject(response);
        }
        if (!MessageDigest.isEqual(expectedToken, provided.getBytes(StandardCharsets.UTF_8))) {
            return reject(response);
        }
        return true;
    }

    /** 统一 401 响应；不携带任何 token 内容。 */
    private static boolean reject(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"code\":401,\"message\":\"Unauthorized\",\"data\":null}");
        return false;
    }
}
