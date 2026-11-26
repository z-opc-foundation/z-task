package com.zifang.z.task.web.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 标记「不需要用户 SSO 登录态」的端点。
 *
 * <p>z-ctc-sso 的 {@code SsoInterceptor} 按<b>注解简单名</b>识别 {@code NoLogin}
 * （{@code isNoLoginAnnotated}），命中即放行用户 SSO 闸门 —— 机对机调用没有浏览器
 * cookie，不能套用用户 SSO 拦截，否则正常同步会全部 401。本注解由业务仓自持
 * （不依赖 z-team-common 的同名注解），<b>简单名必须保持 {@code NoLogin}</b>。
 *
 * <p><b>放行的只是「用户登录态」这一层，绝不等于免鉴权</b>：被标注的端点仍须由
 * 专用拦截器（如 {@link SyncUserTokenInterceptor}）校验服务端 service token；
 * 未配置 token 时一律 401（fail-closed）。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface NoLogin {
}
