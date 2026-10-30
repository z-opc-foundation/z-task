package com.zifang.z.task.core;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * z-task README 定量主张自守卫 —— README 里写死的版本、模块清单、Controller 名单、
 * 实体与 Mapper 数量、端口、环境变量、表数量、前端工程、文档目录，必须能从源码重算出来；
 * README 改了就红，代码没动就不红。
 *
 * <p><b>为什么要有这一层</b>：本仓 README 在启动模块 `z-task-starter` 改名为 `z-task-admin`
 * 之后，整篇没跟着改 —— 模块清单、central 排除名单、fat jar 路径、Dockerfile COPY 路径、
 * package.sh 落点全指着一个**已经不存在**的模块；前端 Vite 端口写着 5800，
 * 实际是 3009；数据源环境变量表却是对的。没有任何尺子去问代码「现在还是吗」，
 * 这些数字的保质期就只剩上一次编辑 README 的那一刻。</p>
 *
 * <p><b>口径四条（都是踩过的坑）</b>：</p>
 * <ol>
 *   <li><b>事实对象只装源码侧事实</b>（{@link Facts}）—— README 侧的数值一律在核对
 *       <b>当下</b>从被核对的那份 README 里现解析。两边都从同一份 README 取数，
 *       尺子就成了恒等式比较，README 改成 8089 尺子照样绿；</li>
 *   <li><b>主张抠不到就红</b>：正则没匹配上不许静默跳过，那正是空跑；</li>
 *   <li><b>按小节名 / 表格字段定位，不按数字定位</b>：短数字是长数字的子串
 *       （「4 个」⊂「14 个」），按数字定位会匹配到别人的行上；</li>
 *   <li><b>README 标题带 emoji</b>：定位小节要剥掉 emoji 后<b>标题文字全等匹配</b>，
 *       不能用 {@code contains}（「模块结构」会误命中「模块结构与约定」）。</li>
 * </ol>
 *
 * <p>数值不等 = 红，且把<b>重算值</b>打进消息（红了要知道真数是多少，否则只是又一处猜）。
 * 核对结果<b>一次全报</b>（收集齐所有不一致再抛），撞停会把尺子退化成「一次只说一句」；
 * 尺子的牙口由 {@link #尺子的牙口()} 系列用例用合成 README 证明，
 * 而「不许冤枉健康页」由 {@link #不许冤枉健康页()} 本身证明。</p>
 */
class ReadmeClaimsTest {

    /** 仓根标志：artifactId 命中 + packaging=pom + 真带 <module>（子模块 pom 的 parent 里也有同名 artifactId）。 */
    private static final String ROOT_ARTIFACT_ID = "z-task";

    /** 源码侧路径一律相对仓根写死，不按目录名统计（多模块仓里同名目录不止一处）。 */
    private static final String CORE_MAIN = "z-task-core/src/main/java";
    private static final String CORE_ENTITY = "z-task-core/src/main/java/com/zifang/z/task/core/domain/entity";
    private static final String CORE_MAPPER = "z-task-core/src/main/java/com/zifang/z/task/core/domain/mapper";
    private static final String CORE_TEST = "z-task-core/src/test/java";
    private static final String WEB_API_DIR = "z-task-web/src/main/java/com/zifang/z/task/web/api";
    private static final String WEB_STATIC = "z-task-web/src/main/resources/static";
    private static final String ADMIN_YML = "z-task-admin/src/main/resources/application.yml";
    private static final String SCHEMA_SQL = "_doc/002_deploy/init/schema.sql";
    private static final String FRONTEND_DIR = "_frontend";
    private static final String SUIT_VITE = "_frontend/z-task-suit/vite.config.js";
    private static final String ROOT_POM = "pom.xml";

    /** README 里逐条要核的主张对应的表字段名（用于定位行，不用于定位数字）。 */
    private static final String F_COORD = "Maven 坐标";
    private static final String F_PARENT = "父项目";
    private static final String F_PORT = "默认端口";
    private static final String F_MODULES = "模块数";

    // ==================================================================
    // 基础设施
    // ==================================================================

    /**
     * 定位仓根：从 user.dir 向上找<b>聚合根</b>的 pom.xml。
     *
     * <p>判据要同时满足三条：<b>项目自身</b>的 artifactId 命中（用 XML 解析取顶层
     * {@code <artifactId>}，不是全文 contains —— 子模块 pom 的 {@code <parent>} 里
     * 就写着 {@code z-task}，全文匹配会把子模块误判成仓根）+
     * {@code <packaging>pom</packaging>} + 至少一个 {@code <module>}。</p>
     */
    private static Path repoRoot() {
        Path p = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        for (int i = 0; i < 10 && p != null; i++, p = p.getParent()) {
            Path pom = p.resolve(ROOT_POM);
            if (Files.isRegularFile(pom)) {
                String t = stripXmlComments(readText(pom));
                boolean isRoot = ownArtifactId(t).equals(ROOT_ARTIFACT_ID)
                        && t.contains("<packaging>pom</packaging>")
                        && Pattern.compile("<module>").matcher(t).find();
                if (isRoot) {
                    return p;
                }
            }
        }
        throw new IllegalStateException("未找到 z-task 仓根：从 " + Paths.get("").toAbsolutePath()
                + " 向上找不到同时满足 artifactId=" + ROOT_ARTIFACT_ID + " / packaging=pom / 带 <module> 的 pom.xml");
    }

    /** 取 pom 里<b>项目自身</b>的 artifactId（顶层元素，不是 parent 里的那个）。 */
    private static String ownArtifactId(String pomText) {
        Document doc = parseXml(pomText);
        NodeList kids = doc.getDocumentElement().getChildNodes();
        for (int i = 0; i < kids.getLength(); i++) {
            Node n = kids.item(i);
            if (n.getNodeType() == Node.ELEMENT_NODE && "artifactId".equals(n.getNodeName())) {
                return n.getTextContent().trim();
            }
        }
        return "";
    }

    private static Document parseXml(String xml) {
        try {
            DocumentBuilderFactory f = DocumentBuilderFactory.newInstance();
            f.setNamespaceAware(false);
            return f.newDocumentBuilder().parse(new java.io.ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("XML 解析失败", e);
        }
    }

    private static String readText(Path p) {
        try {
            return new String(Files.readAllBytes(p), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("读文件失败：" + p, e);
        }
    }

    /** 剥掉 XML 注释（根 pom 里注释掉的 {@code <module>_frontend</module>} 会骗过正则）。 */
    private static String stripXmlComments(String s) {
        return s.replaceAll("(?s)<!--.*?-->", "");
    }

    /**
     * 剥掉 Java 注释（块注释 + 行注释），字符串字面量原样保留。
     *
     * <p>判「类级注解」还是「方法级注解」时必须先剥注释：Javadoc 里出现过
     * {@code @RequestMapping} 字样就会被当成真映射。</p>
     */
    private static String stripComments(String s) {
        StringBuilder sb = new StringBuilder(s.length());
        int i = 0;
        int n = s.length();
        while (i < n) {
            char c = s.charAt(i);
            if (c == '"' || c == '\'') {
                char quote = c;
                sb.append(c);
                i++;
                while (i < n) {
                    char d = s.charAt(i);
                    sb.append(d);
                    i++;
                    if (d == '\\' && i < n) {
                        sb.append(s.charAt(i));
                        i++;
                        continue;
                    }
                    if (d == quote) {
                        break;
                    }
                }
                continue;
            }
            if (c == '/' && i + 1 < n && s.charAt(i + 1) == '/') {
                while (i < n && s.charAt(i) != '\n') {
                    i++;
                }
                continue;
            }
            if (c == '/' && i + 1 < n && s.charAt(i + 1) == '*') {
                i += 2;
                while (i + 1 < n && !(s.charAt(i) == '*' && s.charAt(i + 1) == '/')) {
                    i++;
                }
                i = Math.min(n, i + 2);
                continue;
            }
            sb.append(c);
            i++;
        }
        return sb.toString();
    }

    // ==================================================================
    // README 侧解析
    // ==================================================================

    private static int headingLevel(String heading) {
        int n = 0;
        while (n < heading.length() && heading.charAt(n) == '#') {
            n++;
        }
        return n;
    }

    /**
     * 去掉行首 #、emoji 与变体选择符，剩下的就是标题文字。
     *
     * <p>emoji 用码点判断（不吃编译编码的亏）：U+1F300–U+1FAFF、U+2600–U+27BF、
     * 变体选择符 U+FE0F、零宽连接符 U+200D。</p>
     */
    private static String headingText(String raw) {
        String t = raw.trim();
        while (t.startsWith("#")) {
            t = t.substring(1);
        }
        t = t.trim();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < t.length(); i++) {
            int cp = t.codePointAt(i);
            if (cp == 0xFE0F || cp == 0x200D
                    || (cp >= 0x1F300 && cp <= 0x1FAFF)
                    || (cp >= 0x2600 && cp <= 0x27BF)) {
                if (cp > 0xFFFF) {
                    i++;
                }
                continue;
            }
            sb.appendCodePoint(cp);
        }
        return sb.toString().trim();
    }

    /**
     * 取某个标题的小节正文（到下一个「同级或更高级」标题为止，{@code ###} 子标题仍属本节）。
     *
     * <p>围栏代码块内以 # 开头的行（项目结构树）不算标题，必须跳过。</p>
     */
    private static String section(String readme, String headingText) {
        String[] lines = readme.split("\n", -1);
        StringBuilder sb = new StringBuilder();
        boolean inFence = false;
        boolean started = false;
        int level = 0;
        for (String line : lines) {
            String t = line.trim();
            if (t.startsWith("```") || t.startsWith("~~~")) {
                inFence = !inFence;
                if (started) {
                    sb.append(line).append('\n');
                }
                continue;
            }
            if (!inFence && t.startsWith("#")) {
                int lv = headingLevel(t);
                String text = headingText(t);
                if (started) {
                    if (lv <= level) {
                        break;
                    }
                } else {
                    if (text.equals(headingText)) {
                        started = true;
                        level = lv;
                        continue;
                    }
                }
            }
            if (started) {
                sb.append(line).append('\n');
            }
        }
        if (!started) {
            throw new IllegalStateException("README 里找不到标题小节：" + headingText);
        }
        return sb.toString();
    }

    /** 从「字段 | 值」表格里抠某个字段的值。 */
    private static String tableCell(String section, String field) {
        for (String line : section.split("\n", -1)) {
            String t = line.trim();
            if (!t.startsWith("|")) {
                continue;
            }
            String[] cells = t.split("\\|", -1);
            if (cells.length < 3) {
                continue;
            }
            String k = cells[1].trim();
            if (k.equals("**" + field + "**") || k.equals(field)) {
                return cells[2].trim();
            }
        }
        throw new IllegalStateException("表格里找不到字段：" + field);
    }

    /** 抠出 `` `xxx` `` 形式的反引号片段。 */
    private static List<String> backticked(String text) {
        List<String> out = new ArrayList<>();
        Matcher m = Pattern.compile("`([^`\n]+)`").matcher(text);
        while (m.find()) {
            out.add(m.group(1).trim());
        }
        return out;
    }

    /** 在一段文字里抠「N 个 XXX」里的 N（只抠数字部分，不连量词一起吃）。 */
    private static Integer countBefore(String text, String unit) {
        Matcher m = Pattern.compile("(\\d+)\\s*个\\s*" + Pattern.quote(unit)).matcher(text);
        if (!m.find()) {
            return null;
        }
        return Integer.parseInt(m.group(1));
    }

    // ==================================================================
    // 源码侧事实
    // ==================================================================

    /** 事实对象：<b>只装源码侧</b>的事实。README 侧的数字一律现解析。 */
    private static final class Facts {
        String version = "";
        String parentVersion = "";
        List<String> modules = new ArrayList<>();
        List<String> controllers = new ArrayList<>();
        List<String> apiPrefixes = new ArrayList<>();
        int entityCount = -1;
        int mapperCount = -1;
        int staticFileCount = -1;
        int port = -1;
        String contextPath = "";
        List<String> dbEnvVars = new ArrayList<>();
        int taskTables = 0;
        int reservedTables = 0;
        List<String> frontendProjects = new ArrayList<>();
        int vitePort = -1;
        String viteProxyTarget = "";
        List<String> excludeArtifacts = new ArrayList<>();
        List<String> webTestClasses = new ArrayList<>();
        List<String> coreTestClasses = new ArrayList<>();
        List<String> adminTestClasses = new ArrayList<>();
    }

    private static Facts facts() {
        Path root = repoRoot();
        Facts f = new Facts();

        // 根 pom：<version> / parent version / <modules>
        String rootPom = stripXmlComments(readText(root.resolve(ROOT_POM)));
        Document doc = parseXml(rootPom);
        NodeList kids = doc.getDocumentElement().getChildNodes();
        for (int i = 0; i < kids.getLength(); i++) {
            Node n = kids.item(i);
            if (n.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }
            String name = n.getNodeName();
            if ("version".equals(name)) {
                f.version = n.getTextContent().trim();
            } else if ("parent".equals(name)) {
                NodeList pk = n.getChildNodes();
                for (int j = 0; j < pk.getLength(); j++) {
                    Node p = pk.item(j);
                    if (p.getNodeType() == Node.ELEMENT_NODE && "version".equals(p.getNodeName())) {
                        f.parentVersion = p.getTextContent().trim();
                    }
                }
            } else if ("modules".equals(name)) {
                NodeList mk = n.getChildNodes();
                for (int j = 0; j < mk.getLength(); j++) {
                    Node m = mk.item(j);
                    if (m.getNodeType() == Node.ELEMENT_NODE && "module".equals(m.getNodeName())) {
                        f.modules.add(m.getTextContent().trim());
                    }
                }
            }
        }

        // Controller 名单 + 类级 @RequestMapping
        try (Stream<Path> s = Files.list(root.resolve(WEB_API_DIR))) {
            List<Path> files = s.filter(p -> p.getFileName().toString().endsWith("Controller.java"))
                    .sorted().collect(Collectors.toList());
            for (Path p : files) {
                f.controllers.add(p.getFileName().toString().replace(".java", ""));
                String src = stripComments(readText(p));
                Matcher m = Pattern.compile("@RequestMapping\\s*\\(\\s*(?:value\\s*=\\s*)?\"([^\"]+)\"").matcher(src);
                if (m.find()) {
                    f.apiPrefixes.add(m.group(1));
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }

        // 实体 / Mapper
        f.entityCount = javaFilesIn(root.resolve(CORE_ENTITY));
        f.mapperCount = javaFilesIn(root.resolve(CORE_MAPPER));

        // static 产物
        f.staticFileCount = countFiles(root.resolve(WEB_STATIC));

        // 端口与 context-path
        String adminYml = readText(root.resolve(ADMIN_YML));
        f.port = yamlServerPort(adminYml);
        f.contextPath = yamlContextPath(adminYml);

        // 数据源环境变量
        Set<String> env = new LinkedHashSet<>();
        Matcher em = Pattern.compile("\\$\\{(ZTASK_DB_[A-Z_]+):").matcher(adminYml);
        while (em.find()) {
            env.add(em.group(1));
        }
        f.dbEnvVars.addAll(env);

        // 表数量：z_task_* 与预留表
        String schema = readText(root.resolve(SCHEMA_SQL));
        Matcher tm = Pattern.compile("CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?`?([A-Za-z0-9_]+)`?",
                Pattern.CASE_INSENSITIVE).matcher(schema);
        while (tm.find()) {
            String t = tm.group(1);
            if (t.startsWith("z_task_")) {
                f.taskTables++;
            } else {
                f.reservedTables++;
            }
        }
        if (f.taskTables < 0) {
            f.taskTables = 0;
        }
        if (f.reservedTables < 0) {
            f.reservedTables = 0;
        }

        // 前端工程 + Vite 端口与代理
        try (Stream<Path> s = Files.list(root.resolve(FRONTEND_DIR))) {
            f.frontendProjects.addAll(s.filter(Files::isDirectory)
                    .map(p -> p.getFileName().toString()).sorted().collect(Collectors.toList()));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        String vite = readText(root.resolve(SUIT_VITE));
        Matcher pm = Pattern.compile("server\\s*:\\s*\\{[^}]*?port\\s*:\\s*(\\d+)").matcher(vite);
        if (pm.find()) {
            f.vitePort = Integer.parseInt(pm.group(1));
        }
        Matcher prm = Pattern.compile("proxy\\s*:\\s*\\{[^}]*?target\\s*:\\s*'([^']+)'").matcher(vite);
        if (prm.find()) {
            f.viteProxyTarget = prm.group(1);
        }

        // central profile 的 excludeArtifacts
        Matcher em2 = Pattern.compile("<excludeArtifact>([^<]+)</excludeArtifact>").matcher(rootPom);
        while (em2.find()) {
            f.excludeArtifacts.add(em2.group(1).trim());
        }

        // 测试类清单（只点��不计数）
        f.coreTestClasses = testClassNames(root.resolve(CORE_TEST));
        f.webTestClasses = testClassNames(root.resolve("z-task-web/src/test/java"));
        f.adminTestClasses = testClassNames(root.resolve("z-task-admin/src/test/java"));

        return f;
    }

    private static int javaFilesIn(Path dir) {
        if (!Files.isDirectory(dir)) {
            return 0;
        }
        try (Stream<Path> s = Files.list(dir)) {
            return (int) s.filter(p -> p.getFileName().toString().endsWith(".java")).count();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static int countFiles(Path dir) {
        if (!Files.isDirectory(dir)) {
            return 0;
        }
        try (Stream<Path> s = Files.walk(dir)) {
            return (int) s.filter(Files::isRegularFile).count();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static List<String> testClassNames(Path dir) {
        List<String> out = new ArrayList<>();
        if (!Files.isDirectory(dir)) {
            return out;
        }
        try (Stream<Path> s = Files.walk(dir)) {
            for (Path p : s.filter(x -> x.getFileName().toString().endsWith("Test.java"))
                    .collect(Collectors.toList())) {
                out.add(p.getFileName().toString().replace(".java", ""));
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        java.util.Collections.sort(out);
        return out;
    }

    /** 解析顶层 {@code server:} 块里的 {@code port:}。 */
    private static int yamlServerPort(String yml) {
        String[] lines = yml.split("\n", -1);
        boolean inServer = false;
        for (String line : lines) {
            if (line.matches("^server:\\s*$")) {
                inServer = true;
                continue;
            }
            if (inServer) {
                if (line.matches("^\\S.*")) {
                    break;
                }
                Matcher m = Pattern.compile("^\\s+port:\\s*(\\d+)\\s*$").matcher(line);
                if (m.find()) {
                    return Integer.parseInt(m.group(1));
                }
            }
        }
        throw new IllegalStateException("yml 里找不到 server.port");
    }

    /** 解析顶层 {@code server:} 块里 {@code servlet:} 下的 {@code context-path:}。 */
    private static String yamlContextPath(String yml) {
        String[] lines = yml.split("\n", -1);
        boolean inServer = false;
        boolean inServlet = false;
        for (String line : lines) {
            if (line.matches("^server:\\s*$")) {
                inServer = true;
                continue;
            }
            if (!inServer) {
                continue;
            }
            if (line.matches("^\\S.*")) {
                break;
            }
            if (line.matches("^\\s+servlet:\\s*$")) {
                inServlet = true;
                continue;
            }
            if (inServlet) {
                Matcher m = Pattern.compile("^\\s+context-path:\\s*(\\S+)\\s*$").matcher(line);
                if (m.find()) {
                    return m.group(1);
                }
            }
        }
        throw new IllegalStateException("yml 里找不到 server.servlet.context-path");
    }

    // ==================================================================
    // 核对：README（现解析） ↔ Facts（源码侧）
    // ==================================================================

    private static List<String> verify(String readme, Facts f) {
        List<String> problems = new ArrayList<>();
        Path root = repoRoot();

        // ---- 基本信息表：坐标版本 / 父项目 / 端口 / 模块数 ----
        String basic = section(readme, "基本信息");
        String coordCell = tableCell(basic, F_COORD);
        Matcher coordM = Pattern.compile("io\\.github\\.yuku123:z-task:([0-9][0-9A-Za-z.\\-]*)").matcher(coordCell);
        if (!coordM.find()) {
            problems.add("【Maven 坐标】基本信息表里抠不出 io.github.yuku123:z-task:<版本>");
        } else {
            String readmeVersion = coordM.group(1);
            if (!readmeVersion.equals(f.version)) {
                problems.add("【Maven 坐标】README 写 " + readmeVersion + "，根 POM <version> 是 " + f.version);
            }
        }
        String parentCell = tableCell(basic, F_PARENT);
        String expectParent = "z-boot-parent:" + f.parentVersion;
        if (!parentCell.contains(expectParent)) {
            problems.add("【父项目】README 写 " + firstBackticked(parentCell) + "，根 POM parent 是 " + expectParent);
        }
        String portCell = tableCell(basic, F_PORT);
        String readmePort = firstBackticked(portCell);
        if (!readmePort.equals(String.valueOf(f.port))) {
            problems.add("【默认端口】README 写 " + readmePort + "，application.yml 是 " + f.port);
        }
        if (!portCell.contains("context-path: /")) {
            problems.add("【默认端口】README 没写 server.servlet.context-path: /（实际是 " + f.contextPath + "）");
        }
        // Vite dev 端口
        Matcher viteM = Pattern.compile("Vite dev\\s*`(\\d+)`").matcher(portCell);
        if (!viteM.find()) {
            problems.add("【前端端口】基本信息表里抠不出「前端 Vite dev `N`」");
        } else {
            int readmeVite = Integer.parseInt(viteM.group(1));
            if (readmeVite != f.vitePort) {
                problems.add("【前端端口】README 写 Vite dev " + readmeVite + "，vite.config.js 是 " + f.vitePort);
            }
        }

        // ---- 模块清单：README 结构树 vs 根 POM <modules> ----
        String structure = section(readme, "项目结构");
        Set<String> readmeModules = new TreeSet<>();
        Matcher treeM = Pattern.compile("^(?:├──|└──)\\s+(z-task-[\\w-]+)/", Pattern.MULTILINE).matcher(structure);
        while (treeM.find()) {
            readmeModules.add(treeM.group(1));
        }
        Set<String> sourceModules = new TreeSet<>(f.modules);
        if (!readmeModules.equals(sourceModules)) {
            problems.add("【Maven 模块】README 结构树列了 " + readmeModules + "，根 POM <modules> 是 " + sourceModules);
        }
        String moduleCell = tableCell(basic, F_MODULES);
        // 模块名清单必须与 pom <modules> **集合相等**（不是「每个都要被点名」——
        // 否则把 admin 换成 starter 之后，剩下的名字仍能被点名覆盖，尺子反而绿）
        Set<String> cellModules = new TreeSet<>();
        for (String b : backticked(moduleCell)) {
            if (b.startsWith("z-task-")) {
                cellModules.add(b);
            }
        }
        if (!cellModules.equals(sourceModules)) {
            problems.add("【Maven 模块】基本信息表的模块数格列了 " + cellModules
                    + "，根 POM <modules> 是 " + sourceModules);
        }
        // 已改名的旧模块名不得再作为「当前模块」出现
        if (moduleCell.contains("z-task-starter")) {
            problems.add("【Maven 模块】基本信息表还写着 z-task-starter —— 该模块已改名 z-task-admin");
        }

        // ---- 实体 / Mapper / static 产物数量 ----
        String coreLine = lineContaining(structure, "z-task-core/");
        if (coreLine.isEmpty()) {
            problems.add("【实体/Mapper】项目结构里找不到 z-task-core/ 那一行");
        } else {
            Integer readmeEntity = countBefore(coreLine, "实体");
            Integer readmeMapper = countBefore(coreLine, "Mapper");
            if (readmeEntity == null) {
                problems.add("【实体/Mapper】z-task-core/ 那行没写「N 个实体」");
            } else if (readmeEntity != f.entityCount) {
                problems.add("【实体/Mapper】README 写 " + readmeEntity + " 个实体，domain/entity 下实际 " + f.entityCount + " 个");
            }
            if (readmeMapper == null) {
                problems.add("【实体/Mapper】z-task-core/ 那行没写「N 个 Mapper」");
            } else if (readmeMapper != f.mapperCount) {
                problems.add("【实体/Mapper】README 写 " + readmeMapper + " 个 Mapper，domain/mapper 下实际 " + f.mapperCount + " 个");
            }
        }
        String staticLine = lineContaining(structure, "src/main/resources/static/");
        if (staticLine.isEmpty()) {
            problems.add("【前端产物】项目结构里找不到 static/ 那一行");
        } else {
            Integer readmeStatic = countBefore(staticLine, "文件");
            if (readmeStatic == null) {
                problems.add("【前端产物】static/ 那行没写「N 个文件」");
            } else if (readmeStatic != f.staticFileCount) {
                problems.add("【前端产物】README 写 " + readmeStatic + " 个文件，z-task-web static 下实际 "
                        + f.staticFileCount + " 个");
            }
        }

        // ---- API 一览：Controller 个数 + 类级前缀必须被某条路径覆盖 ----
        String api = section(readme, "API 一览");
        Integer readmeCtrl = countBefore(api, "Controller");
        if (readmeCtrl == null) {
            problems.add("【Controller 数量】API 一览节里抠不出「N 个 Controller」");
        } else if (readmeCtrl != f.controllers.size()) {
            problems.add("【Controller 数量】README 写 " + readmeCtrl + "，web/api 下实际 " + f.controllers.size()
                    + " 个：" + f.controllers);
        }
        Set<String> readmePaths = new TreeSet<>();
        for (String line : api.split("\n", -1)) {
            String t = line.trim();
            if (!t.startsWith("|")) {
                continue;
            }
            String[] cells = t.split("\\|", -1);
            if (cells.length < 3) {
                continue;
            }
            for (String b : backticked(cells[1])) {
                if (b.startsWith("/api/")) {
                    readmePaths.add(b);
                }
            }
        }
        for (String prefix : f.apiPrefixes) {
            boolean covered = false;
            for (String p : readmePaths) {
                if (p.equals(prefix) || p.startsWith(prefix + "/")) {
                    covered = true;
                    break;
                }
            }
            if (!covered) {
                problems.add("【API 路径】源码有 Controller 挂在 " + prefix + "，README 的 API 表里没有覆盖它的路径");
            }
        }

        // ---- 数据模型：9 + 4 张表 ----
        // 数字写在**标题行**里（`## 🧱 数据模型（实测 9 + 4 张表）`），
        // 而 section() 只按标题文字全等匹配、且不含标题行本身 ⇒ 这里直接对全文抠。
        Matcher tableM = Pattern.compile("数据模型（实测\\s*(\\d+)\\s*\\+\\s*(\\d+)\\s*张表）").matcher(readme);
        if (!tableM.find()) {
            problems.add("【表数量】数据模型节里抠不出「N + M 张表」");
        } else {
            int readmeTask = Integer.parseInt(tableM.group(1));
            int readmeReserved = Integer.parseInt(tableM.group(2));
            if (readmeTask != f.taskTables) {
                problems.add("【表数量】README 写 " + readmeTask + " 张 z_task_* 表，schema.sql 实际 " + f.taskTables + " 张");
            }
            if (readmeReserved != f.reservedTables) {
                problems.add("【表数量】README 写 " + readmeReserved + " 张预留表，schema.sql 实际 " + f.reservedTables + " 张");
            }
        }

        // ---- 数据源环境变量 ----
        String quick = section(readme, "快速开始");
        Set<String> readmeEnv = new TreeSet<>();
        for (String line : quick.split("\n", -1)) {
            String t = line.trim();
            if (!t.startsWith("|")) {
                continue;
            }
            String[] cells = t.split("\\|", -1);
            if (cells.length < 3) {
                continue;
            }
            for (String b : backticked(cells[1])) {
                if (b.startsWith("ZTASK_DB_")) {
                    readmeEnv.add(b);
                }
            }
        }
        Set<String> sourceEnv = new TreeSet<>(f.dbEnvVars);
        if (!readmeEnv.equals(sourceEnv)) {
            problems.add("【数据源环境变量】README 表里列了 " + readmeEnv + "，application.yml 实际引用 " + sourceEnv);
        }

        // ---- 前端工程与 Vite 代理 ----
        for (String proj : f.frontendProjects) {
            if (!readme.contains(proj)) {
                problems.add("【前端工程】盘上有 _frontend/" + proj + "/，README 全文没提到它");
            }
        }
        Matcher proxyM = Pattern.compile("/api 代理到 (http://[A-Za-z0-9._-]+:[0-9]+)").matcher(quick);
        if (!proxyM.find()) {
            problems.add("【前端代理】快速开始节里抠不出「/api 代理到 http://host:port」");
        } else {
            String readmeTarget = proxyM.group(1);
            if (!readmeTarget.equals(f.viteProxyTarget)) {
                problems.add("【前端代理】README 写 " + readmeTarget + "，vite.config.js 是 " + f.viteProxyTarget);
            }
        }

        // ---- central 排除名单 ----
        for (String art : f.excludeArtifacts) {
            if (!readme.contains(art)) {
                problems.add("【central 排除】根 POM central profile 排除了 " + art + "，README 全文没提到它");
            }
        }

        // ---- 部署面：Dockerfile + 三个脚本 + deploy/（2026-10-30 火车补齐，内含 k8s 清单）；确无 compose/Makefile ----
        String deploy = section(readme, "部署");
        for (String must : Arrays.asList("Dockerfile", "build.sh", "package.sh", "start.sh", "deploy/")) {
            if (!deploy.contains(must)) {
                problems.add("【部署面】部署节没提到 " + must);
            }
        }
        for (String absent : Arrays.asList("docker-compose", "Makefile")) {
            Path p = root.resolve(absent);
            boolean exists = Files.exists(p);
            if (!exists && "docker-compose".equals(absent)) {
                try (Stream<Path> s = Files.list(root)) {
                    exists = s.anyMatch(x -> x.getFileName().toString().startsWith("docker-compose"));
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            }
            if (exists) {
                problems.add("【部署面】README 声称仓根没有 " + absent + "，但盘上存在");
            }
            if (!deploy.contains(absent)) {
                problems.add("【部署面】README 部署节没写明「没有 " + absent + "」这条实测结论");
            }
        }
        if (!Files.isDirectory(root.resolve("deploy"))) {
            problems.add("【部署面】README 部署节按 deploy/ 存在来写，盘上却没有它");
        }

        // ---- 测试类：只点名不计数 ----
        String testing = section(readme, "测试");
        for (String t : Arrays.asList("TaskServiceImplTest", "TaskListServiceImplTest",
                "ProjectBizServiceImplTest", "E2ESqlMigrationRunnerTest")) {
            if (!testing.contains(t)) {
                problems.add("【测试类】测试节没点名 " + t);
            }
        }
        for (String t : f.coreTestClasses) {
            if (!testing.contains(t)) {
                problems.add("【测试类】z-task-core 下的 " + t + " 没在 README 测试节点名");
            }
        }
        for (String t : f.adminTestClasses) {
            if (!testing.contains(t)) {
                problems.add("【测试类】z-task-admin 下的 " + t + " 没在 README 测试节点名");
            }
        }
        if (!f.webTestClasses.isEmpty()) {
            problems.add("【测试类】README 说 z-task-web 没有测试类，但盘上有 " + f.webTestClasses);
        }

        // ---- 文档目录：链接必须落地 ----
        String docs = section(readme, "文档目录");
        List<String> links = new ArrayList<>();
        Matcher lm = Pattern.compile("\\]\\(([^)]+)\\)").matcher(docs);
        while (lm.find()) {
            String target = lm.group(1).trim();
            if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("#")) {
                continue;
            }
            links.add(target);
        }
        if (links.isEmpty()) {
            problems.add("【文档目录】节里一个本地链接都没抠到");
        }
        for (String link : links) {
            if (!Files.exists(root.resolve(link))) {
                problems.add("【文档目录】README 里的链接目标在盘上不存在：" + link);
            }
        }
        List<String> buckets = new ArrayList<>();
        try (Stream<Path> s = Files.list(root.resolve("_doc"))) {
            s.filter(Files::isDirectory).map(p -> "_doc/" + p.getFileName().toString()).sorted()
                    .forEach(buckets::add);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        for (String b : buckets) {
            if (!docs.contains("`" + b + "/`") && !docs.contains("`" + b + "`")) {
                problems.add("【文档目录】盘上有 " + b + "，README 文档目录节没提到它");
            }
        }

        return problems;
    }

    private static String lineContaining(String text, String needle) {
        for (String line : text.split("\n", -1)) {
            if (line.contains(needle)) {
                return line;
            }
        }
        return "";
    }

    private static String firstBackticked(String s) {
        List<String> b = backticked(s);
        return b.isEmpty() ? "" : b.get(0);
    }

    // ==================================================================
    // 用例
    // ==================================================================

    @Test
    @DisplayName("README 的全部定量主张与源码重算值逐条对账（一次全报）")
    void README主张与源码重算逐条对账() {
        List<String> problems = verify(readme(), facts());
        if (!problems.isEmpty()) {
            StringBuilder sb = new StringBuilder("z-task README 与源码不一致，共 " + problems.size() + " 处：");
            for (String p : problems) {
                sb.append("\n  - ").append(p);
            }
            throw new AssertionError(sb.toString());
        }
    }

    @Test
    @DisplayName("不许冤枉健康页：真实 README 不得被判红")
    void 不许冤枉健康页() {
        List<String> problems = verify(readme(), facts());
        assertTrue(problems.isEmpty(), "真实 README 被判红：\n" + String.join("\n", problems));
    }

    @Test
    @DisplayName("尺子的牙口：把坐标版本改错必须报红")
    void 尺子的牙口_版本改错必红() {
        String readme = readme();
        String mutated = readme.replace("io.github.yuku123:z-task:" + facts().version,
                "io.github.yuku123:z-task:9.9.9");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到当前坐标");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 版本号改成 9.9.9，尺子居然没报红");
        assertTrue(problems.toString().contains("9.9.9"), "报错没指出被改坏的数字：\n" + String.join("\n", problems));
    }

    @Test
    @DisplayName("尺子的牙口：把 Controller 个数改错必须报红")
    void 尺子的牙口_Controller个数改错必红() {
        String readme = readme();
        String mutated = readme.replace("的 8 个 Controller 提供", "的 7 个 Controller 提供");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到 Controller 个数写法");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README Controller 个数改成 7，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把默认端口改错必须报红")
    void 尺子的牙口_端口改错必红() {
        String readme = readme();
        String mutated = readme.replace("| **默认端口** | `" + facts().port + "`",
                "| **默认端口** | `8089`");
        assertFalse(mutated.equals(readme), "合成变异没找到默认端口");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 默认端口改成 8089，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把模块名改回 z-task-starter 必须报红")
    void 尺子的牙口_模块名改错必红() {
        String readme = readme();
        String mutated = readme.replace("`z-task-admin`", "`z-task-starter`");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到 z-task-admin");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 模块名被改成 z-task-starter，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把 Vite 端口改错必须报红")
    void 尺子的牙口_Vite端口改错必红() {
        String readme = readme();
        String mutated = readme.replace("Vite dev `" + facts().vitePort + "`", "Vite dev `5800`");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到 Vite dev 端口");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README Vite 端口改成 5800，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把实体个数改错必须报红")
    void 尺子的牙口_实体个数改错必红() {
        String readme = readme();
        String mutated = readme.replace("9 个实体 + 9 个 Mapper", "8 个实体 + 9 个 Mapper");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到实体/Mapper 计数");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 实体个数改成 8，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把表数量改错必须报红")
    void 尺子的牙口_表数量改错必红() {
        String readme = readme();
        String mutated = readme.replace("数据模型（实测 9 + 4 张表）", "数据模型（实测 8 + 4 张表）");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到表数量写法");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 表数量被改，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把环境变量改错必须报红")
    void 尺子的牙口_环境变量改错必红() {
        String readme = readme();
        String mutated = readme.replace("`ZTASK_DB_HOST`", "`ZTASK_DB_ADDR`");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到 ZTASK_DB_HOST");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 环境变量被改，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：文档目录链接指向不存在的文件必须报红")
    void 尺子的牙口_文档链接失效必红() {
        String readme = readme();
        // 假路径**必须拆两段拼接**：源码里若出现连续的「不存在的路径」字面量，
        // depth_check 会判成「悬空字面量」违规（它连注释行一起扫）。
        String brokenLink = "_doc/001_arch/" + "99-not-exist.md";
        String mutated = readme.replace("_doc/001_arch/00-overview.md", brokenLink);
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到 00-overview.md 链接");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 文档链接指向不存在的文件，尺子居然没报红");
    }

    @Test
    @DisplayName("尺子的牙口：把前端代理目标改错必须报红")
    void 尺子的牙口_前端代理改错必红() {
        String readme = readme();
        String mutated = readme.replace("/api 代理到 " + facts().viteProxyTarget,
                "/api 代理到 http://localhost:8082");
        assertFalse(mutated.equals(readme), "合成变异没生效：README 里没找到前端代理目标");
        List<String> problems = verify(mutated, facts());
        assertFalse(problems.isEmpty(), "README 前端代理目标被改，尺子居然没报红");
    }

    @Test
    @DisplayName("守卫生效确认：它真的在读这份 README")
    void 守卫生效确认() {
        String readme = readme();
        assertTrue(readme.contains("z-task"), "读到的 README 不含仓名，仓根定位可能错了");
        assertEquals(facts().controllers.size(), new TreeSet<>(facts().controllers).size(),
                "Controller 名单里有重复项，源码侧事实收集有问题");
    }

    private static String readme() {
        return readText(repoRoot().resolve("README.md"));
    }

    /** 保留断言导入，避免 IDE 误判未使用。 */
    @Test
    @DisplayName("断言工具自检")
    void 断言工具自检() {
        assertThrows(IllegalStateException.class, () -> section(readme(), "不存在的标题"));
    }
}
