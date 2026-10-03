package com.zifang.z.task.starter.host;

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
 * 启动时检查 _doc/004_sql/z-fix-e2e-bad-sql-grammar.sql 是否执行过, 如没有则跑一次.
 * 跑过的表会写到 z_e2e_migration_log 表 (自建, 不会和业务冲突).
 * 失败不抛 (避免影响主启动), 仅记日志.
 * <p>
 * 触发方式: Spring 启动完成 (CommandLineRunner), 按 @Order 早期执行.
 * <p>
 * 关闭: application.properties 加 {@code z.e2e.migration.enabled=false} 即可.
 */
@Component
@Order(1)
public class E2ESqlMigrationRunner implements CommandLineRunner {

    private static final Logger log = LogManager.getLogger(E2ESqlMigrationRunner.class);
    private static final String MARKER_TABLE = "z_e2e_migration_log";
    private static final String MARKER_ENTRY = "e2e-bad-sql-grammar-fix-v6";
    private static final String[] SCRIPTS = {
            "_doc/004_sql/z-fix-e2e-bad-sql-grammar.sql",
            "_doc/004_sql/z-fix-e2e-alter-columns-v3.sql",
            "_doc/004_sql/z-fix-e2e-alter-columns-v6-final.sql"
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
            log.info("[E2E SQL] 开始执行 z-fix-e2e-bad-sql-grammar.sql 迁移...");
            ensureMarkerTable(conn);
            int created = executeSqlScript(conn);
            recordRun(conn);
            log.info("[E2E SQL] 迁移完成, 共执行 {} 个 DDL 块", created);
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

    private int executeSqlScript(Connection conn) throws Exception {
        int total = 0;
        for (String scriptPath : SCRIPTS) {
            log.info("[E2E SQL] 执行脚本: {}", scriptPath);
            int n = executeOneScript(conn, scriptPath);
            log.info("[E2E SQL]   -> {} 个 DDL 块", n);
            total += n;
        }
        return total;
    }

    private int executeOneScript(Connection conn, String scriptPath) throws Exception {
        String script;
        try (InputStream is = openScript(scriptPath)) {
            if (is == null) {
                log.warn("[E2E SQL] 找不到迁移脚本 {}", scriptPath);
                return 0;
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
                log.debug("[E2E SQL] DDL 块失败 (跳过): {} -- {}", trimmed.substring(0, Math.min(80, trimmed.length())), e.getMessage());
            }
        }
        return n;
    }

    private InputStream openScript(String scriptPath) {
        // 尝试多个路径
        String[] paths = {
                scriptPath,
                "classpath:" + scriptPath,
                "/Users/zifang/workplace/idea_workplace/z-opc/" + scriptPath
        };
        for (String p : paths) {
            if (p.startsWith("classpath:")) {
                InputStream is = getClass().getClassLoader().getResourceAsStream(p.substring("classpath:".length()));
                if (is != null) return is;
            } else {
                try {
                    return new java.io.FileInputStream(p);
                } catch (Exception ignore) {
                }
            }
        }
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
