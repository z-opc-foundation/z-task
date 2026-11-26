package com.zifang.z.task.core.support;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.util.Map;

/**
 * 单测支撑: JDK 动态代理 + 反射注入 (零 Mockito, 家法规范).
 */
public final class Proxies {

    private Proxies() {
    }

    /**
     * 按方法名分发返回值的动态代理.
     * <p>
     * 未显式登记的方法返回 null / false / 0 的安全默认值.
     */
    @SuppressWarnings("unchecked")
    public static <T> T of(Class<T> iface, Map<String, Invocation> answers) {
        return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class<?>[]{iface},
                (proxy, method, args) -> {
                    if (method.getDeclaringClass() == Object.class) {
                        return method.invoke(proxy, args);
                    }
                    Invocation inv = answers.get(method.getName());
                    return inv != null ? inv.call(args) : defaultValue(method.getReturnType());
                });
    }

    private static Object defaultValue(Class<?> type) {
        if (!type.isPrimitive()) {
            return null;
        }
        if (type == boolean.class) {
            return false;
        }
        if (type == long.class) {
            return 0L;
        }
        if (type == double.class) {
            return 0d;
        }
        if (type == float.class) {
            return 0f;
        }
        if (type == short.class) {
            return (short) 0;
        }
        if (type == byte.class) {
            return (byte) 0;
        }
        if (type == char.class) {
            return (char) 0;
        }
        return 0;
    }

    /**
     * 反射注入私有字段 (@Autowired/@Resource 字段无 setter).
     */
    public static void inject(Object target, String fieldName, Object value) {
        Class<?> type = target.getClass();
        while (type != null) {
            try {
                Field f = type.getDeclaredField(fieldName);
                f.setAccessible(true);
                f.set(target, value);
                return;
            } catch (NoSuchFieldException e) {
                type = type.getSuperclass();
            } catch (IllegalAccessException e) {
                throw new IllegalStateException(e);
            }
        }
        throw new IllegalArgumentException("no field: " + fieldName + " on " + target.getClass());
    }

    @FunctionalInterface
    public interface Invocation {
        Object call(Object[] args) throws Throwable;
    }
}
