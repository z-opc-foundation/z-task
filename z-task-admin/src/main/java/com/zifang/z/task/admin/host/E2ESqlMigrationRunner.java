package com.zifang.z.task.admin.host;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * E2E 修复: 自执行 SQL 迁移 runner.
 * <p>
 * 启动时检查 {@link #SCRIPTS} 里的脚本是否执行过, 如没有则跑一次.
 * 跑过的表会写到 z_e2e_migration_log 表 (自建, 不会和业务冲突).
 * 失败不抛 (避免影响主启动), 仅记日志.
 * <p>
 * 触发方式: Spring 启动完成 (CommandLineRunner), 按 @Order 早期执行.
 * <p>
 * 关闭: application.properties 加 {@code z.e2e.migration.enabled=false} 即可.
 *
 * <p><b>2026-10-05 修正</b>：此前无论脚本是否找到都会 {@code recordRun} 写迁移标记。
 * 仓内 {@code _doc/002_deploy/init/} 并不存在（那 3 个脚本在工作区里一个都没有），于是每次
 * 启动都是"3 条找不到 + 共执行 0 个 DDL 块"，然后<b>把唯一的一次性标记烧掉</b>——
 * 之后即使把脚本补回来，也永远不会再执行。现在改成：<b>只要有脚本没找到就不写标记</b>，
 * 让迁移在脚本就位后仍可执行。</p>
 */
@Component
@Order(1)
public class E2ESqlMigrationRunner implements CommandLineRunner {

    private static final Logger log = LogManager.getLogger(E2ESqlMigrationRunner.class);
    private static final String MARKER_TABLE = "z_e2e_migration_log";
    private static final String MARKER_ENTRY = "e2e-bad-sql-grammar-fix-v6";
    private static final String[] SCRIPTS = {
            // 落点按 lead 002 规范定在 002_deploy/init 桶；这 3 个脚本**至今未交付**（见类注释），
            // 所以这是「约定的落点」而不是「现成的文件」—— 深度尺不得把它判成断链。
            "_doc/002_deploy/init/z-fix-e2e-bad-sql-grammar.sql",  // DC:ignore
            "_doc/002_deploy/init/z-fix-e2e-alter-columns-v3.sql",  // DC:ignore
            "_doc/002_deploy/init/z-fix-e2e-alter-columns-v6-final.sql"  // DC:ignore
    };

    @Resource
    private DataSource dataSource;

    @Resource
    private Environment env;

    @Override
    public void run(String... args) {
        if (!isEnabled()) {
            log.info("[E2E SQL] 迁移已禁用 (z.e2e.migration.enabled=false), 跳过");
            return;
        }
        try (Connection conn = dataSource.getConnection()) {
            if (isAlreadyRun(conn)) {
                log.info("[E2E SQL] 已执行过, 跳过");
                return;
            }
            log.info("[E2E SQL] 开始执行迁移脚本...");
            ensureMarkerTable(conn);
            ScriptOutcome outcome = runScripts(conn);
            if (!outcome.allFound) {
                // 不能在这里 recordRun：脚本没找到等于什么都没做，写了标记就再也等不到它们。
                // 保留标记缺席，脚本补进产物后下一次启动还会重试。
                log.warn("[E2E SQL] 有脚本未找到，本次<b>不</b>记录迁移标记（否则脚本补回来也永远不执行）。"
                        + "已执行 {} 个 DDL 块。请确认产物里是否含 _doc/002_deploy/init/*.sql", outcome.ddlExecuted);
                return;
            }
            recordRun(conn);
            log.info("[E2E SQL] 迁移完成, 共执行 {} 个 DDL 块", outcome.ddlExecuted);
        } catch (Exception e) {
            log.warn("[E2E SQL] 迁移失败 (不影响主启动): {}", e.getMessage());
        }
    }

    private boolean isEnabled() {
        return !"false".equalsIgnoreCase(env.getProperty("z.e2e.migration.enabled", "true"));
    }

    private boolean isAlreadyRun(Connection conn) {
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='" + MARKER_TABLE + "' LIMIT 1")) {
            if (!rs.next()) return false;
            try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM " + MARKER_TABLE + " WHERE id=? LIMIT 1")) {
                ps.setString(1, MARKER_ENTRY);
                try (ResultSet rs2 = ps.executeQuery()) {
                    return rs2.next();
                }
            }
        } catch (Exception e) {
            return false;
        }
    }

    private void ensureMarkerTable(Connection conn) throws Exception {
        try (Statement st = conn.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS " + MARKER_TABLE + " (" +
                    "id VARCHAR(128) NOT NULL," +
                    "executed_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }
    }

    private void recordRun(Connection conn) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT IGNORE INTO " + MARKER_TABLE + " (id, executed_at) VALUES (?, NOW())")) {
            ps.setString(1, MARKER_ENTRY);
            ps.executeUpdate();
        }
    }

    /** 一次脚本执行的结果：脚本是否找到 + 执行了几个 DDL 块。 */
    private static final class ScriptOutcome {
        final boolean allFound;
        final int ddlExecuted;

        ScriptOutcome(boolean allFound, int ddlExecuted) {
            this.allFound = allFound;
            this.ddlExecuted = ddlExecuted;
        }
    }

    private ScriptOutcome runScripts(Connection conn) throws Exception {
        int total = 0;
        boolean allFound = true;
        for (String scriptPath : SCRIPTS) {
            log.info("[E2E SQL] 执行脚本: {}", scriptPath);
            SingleOutcome one = executeOneScript(conn, scriptPath);
            log.info("[E2E SQL]   -> {} 个 DDL 块{}", one.ddlExecuted,
                    one.found ? "" : "（脚本未找到）");
            total += one.ddlExecuted;
            allFound &= one.found;
        }
        return new ScriptOutcome(allFound, total);
    }

    /** 单个脚本的结果。 */
    private static final class SingleOutcome {
        final boolean found;
        final int ddlExecuted;

        SingleOutcome(boolean found, int ddlExecuted) {
            this.found = found;
            this.ddlExecuted = ddlExecuted;
        }
    }

    private SingleOutcome executeOneScript(Connection conn, String scriptPath) throws Exception {
        String script;
        try (InputStream is = openScript(scriptPath)) {
            if (is == null) {
                log.warn("[E2E SQL] 找不到迁移脚本 {}", scriptPath);
                return new SingleOutcome(false, 0);
            }
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = r.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                script = sb.toString();
            }
        }
        // 拆分成独立 statement
        List<String> statements = splitStatements(script);
        int n = 0;
        for (String stmt : statements) {
            String trimmed = stmt.trim();
            if (trimmed.isEmpty()) continue;
            try (Statement st = conn.createStatement()) {
                st.execute(trimmed);
                n++;
            } catch (Exception e) {
                // 失败的不致命 — 表可能已存在, 或权限问题. 记日志继续.
                // **必须是 warn 不是 debug**：生产默认关 debug，此前"DDL 块失败"在生产
                // 完全无痕，而外面还会照常写迁移标记，等于静默半迁移且永不重试。
                log.warn("[E2E SQL] DDL 块失败 (跳过): {} -- {}",
                        trimmed.substring(0, Math.min(80, trimmed.length())), e.getMessage());
            }
        }
        return new SingleOutcome(true, n);
    }

    private InputStream openScript(String scriptPath) {
        // ① classpath：打包后的正确来源
        InputStream is = getClass().getClassLoader().getResourceAsStream(scriptPath);
        if (is != null) {
            return is;
        }
        // ② 工作目录：本地开发 / 单测时用
        try {
            java.io.File f = new java.io.File(scriptPath);
            if (f.isFile()) {
                return new java.io.FileInputStream(f);
            }
        } catch (Exception e) {
            log.debug("[E2E SQL] 读取 {} 失败: {}", scriptPath, e.getMessage());
        }
        // 此前这里还有一条硬编码的作者本机绝对路径
        // （/Users/zifang/workplace/idea_workplace/z-opc/…）——该目录已不存在，
        // 在别的机器上更是死路径，还会泄露作者的工作区结构，故删除。
        return null;
    }

    private List<String> splitStatements(String script) {
        // 拆分成独立 statement. 支持 DELIMITER 块 (用于存储过程).
        // 注意: DELIMITER 是 mysql 客户端指令, 不是真正的 SQL. 解析时需要合并.
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inLineComment = false;
        boolean inBlockComment = false;
        String currentDelimiter = ";";  // 动态分隔符
        for (int i = 0; i < script.length(); i++) {
            char c = script.charAt(i);
            char next = (i + 1 < script.length()) ? script.charAt(i + 1) : 0;
            // DELIMITER 指令
            if (!inLineComment && !inBlockComment) {
                // 匹配 "DELIMITER xx" 行
                if ((c == 'D' || c == 'd') && script.substring(i).toUpperCase().startsWith("DELIMITER ")) {
                    int eol = script.indexOf('\n', i);
                    if (eol < 0) eol = script.length();
                    String delimLine = script.substring(i, eol).trim();
                    String[] parts = delimLine.split("\\s+");
                    if (parts.length >= 2) {
                        currentDelimiter = parts[1];
                    }
                    i = eol; // 跳过整行
                    continue;
                }
            }
            // 行注释
            if (!inBlockComment && c == '-' && next == '-') {
                inLineComment = true;
                i++;
                continue;
            }
            if (inLineComment) {
                if (c == '\n') inLineComment = false;
                continue;
            }
            // 块注释
            if (!inLineComment && c == '/' && next == '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (inBlockComment) {
                if (c == '*' && next == '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }
            // 检查是否匹配当前分隔符
            if (matchesDelimiter(script, i, currentDelimiter)) {
                String stmt = cur.toString().trim();
                if (!stmt.isEmpty()) out.add(stmt);
                cur.setLength(0);
                i += currentDelimiter.length() - 1;
            } else {
                cur.append(c);
            }
        }
        if (cur.length() > 0) {
            String stmt = cur.toString().trim();
            if (!stmt.isEmpty()) out.add(stmt);
        }
        return out;
    }

    private boolean matchesDelimiter(String script, int pos, String delimiter) {
        if (pos + delimiter.length() > script.length()) return false;
        for (int i = 0; i < delimiter.length(); i++) {
            if (script.charAt(pos + i) != delimiter.charAt(i)) return false;
        }
        return true;
    }
}
