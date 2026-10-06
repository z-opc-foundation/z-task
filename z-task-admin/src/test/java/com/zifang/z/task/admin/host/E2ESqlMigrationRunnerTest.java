package com.zifang.z.task.admin.host;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.io.ByteArrayInputStream;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * {@link E2ESqlMigrationRunner} 不得在"脚本没找到"时写迁移标记。
 *
 * <p>仓内 {@code _doc/004_sql/} 并不存在——那 3 个脚本在工作区里一个都没有。而修复前
 * 的流程是：{@code openScript} 全部返回 null → 3 条"找不到"warn → 执行 0 个 DDL 块 →
 * <b>{@code recordRun} 照常执行</b>，把唯一的一次性标记烧掉。于是即使日后把脚本补进
 * 产物，那套数据库也永远不会再执行迁移，而且生产日志里只剩一行"共执行 0 个 DDL 块"。</p>
 *
 * <p>本测试用动态代理造一份 JDBC 假连接（不引入 H2 / Mockito 依赖），只关心一件事：
 * <b>{@code recordRun} 的那条 INSERT 有没有被打出去</b>。</p>
 */
class E2ESqlMigrationRunnerTest {

    /** 记录所有执行过的 SQL，便于断言"标记 INSERT 有没有发生"。 */
    private static final class SqlRecorder implements InvocationHandler {
        final List<String> executed = new ArrayList<>();
        /** information_schema 查询返回"标记表已存在"还是"不存在"。 */
        boolean markerTableExists = false;
        /** 标记表里那条 id 行是否存在（表存在 ≠ 已执行过）。 */
        boolean markerRowExists = false;
        /** DDL 执行是否抛错（模拟"半迁移"）。 */
        boolean ddlFails = false;

        @Override
        public Object invoke(Object proxy, Method m, Object[] args) throws Throwable {
            String name = m.getName();
            switch (name) {
                case "createStatement":
                    return stmtProxy(executed, ddlFails);
                case "prepareStatement":
                    String sql = String.valueOf(args[0]);
                    executed.add(sql);
                    if (sql.contains("INSERT")) {
                        return psProxy(true);
                    }
                    if (sql.contains("information_schema")) {
                        return stmtProxy(executed, false, true);
                    }
                    return psProxy(false);
                case "executeQuery":
                    return rsProxy(Boolean.FALSE);
                case "next":
                    return Boolean.FALSE;
                case "close":
                case "commit":
                case "rollback":
                case "setAutoCommit":
                    return null;
                case "isClosed":
                    return Boolean.FALSE;
                case "toString":
                    return "fake";
                case "hashCode":
                    return System.identityHashCode(proxy);
                case "equals":
                    return proxy == args[0];
                default:
                    return defaultValue(m.getReturnType());
            }
        }

        private Object stmtProxy(List<String> sink, boolean fail) {
            return stmtProxy(sink, fail, false);
        }

        private Object stmtProxy(List<String> sink, boolean fail, boolean infoSchema) {
            return Proxy.newProxyInstance(getClass().getClassLoader(),
                    new Class[]{Statement.class}, (p, m, a) -> {
                        switch (m.getName()) {
                            case "execute":
                                String sql = String.valueOf(a[0]);
                                sink.add(sql);
                                if (fail && !infoSchema) {
                                    throw new java.sql.SQLException("boom");
                                }
                                if (infoSchema) {
                                    return null;
                                }
                                return Boolean.TRUE;
                            case "executeQuery":
                                sink.add(String.valueOf(a[0]));
                                return rsProxy(markerTableExists);
                            case "close":
                                return null;
                            case "toString":
                                return "stmt";
                            case "hashCode":
                                return System.identityHashCode(p);
                            case "equals":
                                return p == a[0];
                            default:
                                return defaultValue(m.getReturnType());
                        }
                    });
        }

        private Object psProxy(boolean isInsert) {
            return Proxy.newProxyInstance(getClass().getClassLoader(),
                    new Class[]{PreparedStatement.class}, (p, m, a) -> {
                        switch (m.getName()) {
                            case "executeUpdate":
                                return isInsert ? 1 : 0;
                            case "setString":
                                return null;
                            case "executeQuery":
                                return rsProxy(markerRowExists);
                            case "close":
                                return null;
                            case "toString":
                                return "ps";
                            case "hashCode":
                                return System.identityHashCode(p);
                            case "equals":
                                return p == a[0];
                            default:
                                return defaultValue(m.getReturnType());
                        }
                    });
        }

        private Object rsProxy(final boolean hasRow) {
            // JDBC 语义：第一次 next() 返回 hasRow，之后恒 false。
            // 写死 FALSE 会让"已标记"这个场景根本模拟不出来。
            final boolean[] consumed = {false};
            return Proxy.newProxyInstance(getClass().getClassLoader(),
                    new Class[]{ResultSet.class}, (p, m, a) -> {
                        switch (m.getName()) {
                            case "next":
                                if (!consumed[0]) {
                                    consumed[0] = true;
                                    return hasRow;
                                }
                                return Boolean.FALSE;
                            case "close":
                                return null;
                            case "toString":
                                return "rs";
                            case "hashCode":
                                return System.identityHashCode(p);
                            case "equals":
                                return p == a[0];
                            default:
                                return defaultValue(m.getReturnType());
                        }
                    });
        }

        private boolean markerInserted() {
            for (String s : executed) {
                if (s.contains("INSERT") && s.contains("z_e2e_migration_log")) {
                    return true;
                }
            }
            return false;
        }
    }

    private static Object defaultValue(Class<?> t) {
        if (!t.isPrimitive()) return null;
        if (t == boolean.class) return Boolean.FALSE;
        if (t == int.class) return 0;
        if (t == long.class) return 0L;
        if (t == short.class) return (short) 0;
        if (t == byte.class) return (byte) 0;
        if (t == double.class) return 0d;
        if (t == float.class) return 0f;
        if (t == char.class) return (char) 0;
        return null;
    }

    /**
     * 造一个只认 {@code z.e2e.migration.enabled} 的 Environment。
     * <p>不用 {@code MockEnvironment}——它在 {@code spring-test} 里，而本模块测试 classpath
     * 上只有 {@code spring-boot-test}；这里用代理省掉一个依赖。</p>
     */
    private static org.springframework.core.env.Environment env(final String value) {
        return (org.springframework.core.env.Environment) Proxy.newProxyInstance(
                E2ESqlMigrationRunnerTest.class.getClassLoader(),
                new Class[]{org.springframework.core.env.Environment.class},
                (p, m, a) -> {
                    if ("getProperty".equals(m.getName())
                            && a.length >= 1 && "z.e2e.migration.enabled".equals(a[0])) {
                        return value;
                    }
                    if ("toString".equals(m.getName())) return "fakeEnv";
                    if ("hashCode".equals(m.getName())) return System.identityHashCode(p);
                    if ("equals".equals(m.getName())) return p == a[0];
                    return defaultValue(m.getReturnType());
                });
    }

    private static E2ESqlMigrationRunner runner(SqlRecorder rec) throws Exception {
        final SqlRecorder r = rec;
        DataSource ds = (DataSource) Proxy.newProxyInstance(
                E2ESqlMigrationRunnerTest.class.getClassLoader(),
                new Class[]{DataSource.class},
                (p, m, a) -> {
                    if ("getConnection".equals(m.getName())) {
                        return Proxy.newProxyInstance(
                                E2ESqlMigrationRunnerTest.class.getClassLoader(),
                                new Class[]{Connection.class}, r);
                    }
                    return defaultValue(m.getReturnType());
                });

        E2ESqlMigrationRunner runner = new E2ESqlMigrationRunner();
        set(runner, "dataSource", ds);
        set(runner, "env", env("true"));
        return runner;
    }

    private static void set(Object target, String field, Object value) throws Exception {
        java.lang.reflect.Field f = target.getClass().getDeclaredField(field);
        f.setAccessible(true);
        f.set(target, value);
    }

    // ==================================================================

    @Test
    @DisplayName("脚本找不到时不得写迁移标记（修复前会写，把一次性机会烧掉）")
    void doesNotMarkWhenScriptsMissing() throws Exception {
        SqlRecorder rec = new SqlRecorder();
        E2ESqlMigrationRunner runner = runner(rec);

        runner.run();

        assertFalse(rec.markerInserted(),
                "一个脚本都没找到却写了迁移标记：脚本补进产物后也永远不会执行。"
                        + "已执行的 SQL: " + rec.executed);
    }

    @Test
    @DisplayName("对照组：仓内脚本确实不存在（说明上面那条不是在测一个虚构场景）")
    void scriptsReallyAreMissing() {
        // 与 E2ESqlMigrationRunner.SCRIPTS 对应，这里独立断言一次事实
        String[] expected = {
                "_doc/004_sql/z-fix-e2e-bad-sql-grammar.sql",
                "_doc/004_sql/z-fix-e2e-alter-columns-v3.sql",
                "_doc/004_sql/z-fix-e2e-alter-columns-v6-final.sql"
        };
        for (String p : expected) {
            assertTrue(getClass().getClassLoader().getResource(p) == null,
                    p + " 竟然在 classpath 上 —— 若真在，则上面那条断言的前提变了，需重写");
            assertFalse(new java.io.File(p).isFile(),
                    p + " 竟然在工作目录下 —— 同上");
        }
    }

    @Test
    @DisplayName("表存在但标记行不存在 ⇒ 仍要跑（表存在 ≠ 已执行过）")
    void tableExistsButNotYetMarkedStillRuns() throws Exception {
        SqlRecorder rec = new SqlRecorder();
        rec.markerTableExists = true;
        rec.markerRowExists = false;
        E2ESqlMigrationRunner runner = runner(rec);

        runner.run();

        boolean queriedRow = false;
        for (String s : rec.executed) {
            if (s.contains("FROM z_e2e_migration_log WHERE id=")) {
                queriedRow = true;
            }
        }
        assertTrue(queriedRow, "应查了标记行，实际 SQL: " + rec.executed);
        assertFalse(rec.markerInserted(), "还没标记过却写了标记，实际 SQL: " + rec.executed);
    }

    @Test
    @DisplayName("标记行已存在 ⇒ 整个迁移被跳过，不建表不写标记")
    void skipsWhenAlreadyMarked() throws Exception {
        SqlRecorder rec = new SqlRecorder();
        rec.markerTableExists = true;
        rec.markerRowExists = true;
        E2ESqlMigrationRunner runner = runner(rec);

        runner.run();

        // 检查用的两条 SELECT 应该有；任何变更语句（建表 / INSERT 标记）都不该有
        assertFalse(rec.markerInserted(), "已标记过还写了标记，实际 SQL: " + rec.executed);
        for (String s : rec.executed) {
            assertFalse(s.contains("CREATE TABLE"),
                    "已标记过却还建表，实际 SQL: " + rec.executed);
        }
    }

    @Test
    @DisplayName("迁移整体抛错时也不写标记（只有全部脚本就位才写）")
    void doesNotMarkOnError() throws Exception {
        SqlRecorder rec = new SqlRecorder();
        rec.ddlFails = true;
        E2ESqlMigrationRunner runner = runner(rec);

        runner.run();

        assertFalse(rec.markerInserted(),
                "DDL 失败仍写了标记：半迁移被记成完成且永不重试。SQL: " + rec.executed);
    }

    @Test
    @DisplayName("z.e2e.migration.enabled=false 时完全不动数据库")
    void disabledDoesNothing() throws Exception {
        SqlRecorder rec = new SqlRecorder();
        E2ESqlMigrationRunner runner = runner(rec);
        set(runner, "env", env("false"));

        runner.run();

        assertTrue(rec.executed.isEmpty(), "禁用时不该执行任何 SQL，实际: " + rec.executed);
    }

    @Test
    @DisplayName("标记表会被建出来（即使脚本缺失，后续重试需要它）")
    void createsMarkerTable() throws Exception {
        SqlRecorder rec = new SqlRecorder();
        E2ESqlMigrationRunner runner = runner(rec);

        runner.run();

        boolean created = false;
        for (String s : rec.executed) {
            if (s.contains("CREATE TABLE IF NOT EXISTS") && s.contains("z_e2e_migration_log")) {
                created = true;
            }
        }
        assertTrue(created, "标记表应当建出来，否则脚本补回来后 isAlreadyRun 查不到、也无法记录。SQL: " + rec.executed);
    }
}
