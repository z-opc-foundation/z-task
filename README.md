# z-task

> 任务协作管理平台

类似 Trello/Jira 的任务协作平台, 支持项目/任务/标签/成员管理

---

## 📋 基本信息

| 字段 | 值 |
|------|-----|
| **项目** | z-task |
| **分类** | 业务应用 · 项目管理 |
| **父项目** | z-opc (com.zifang:z-opc:1.0.0-SNAPSHOT) |
| **默认端口** | `8082` (前端 Vite dev 5800) |
| **文档维护** | z-opc-foundation |
| **最近更新** | 2026-09-24 |

---

## 🎯 核心功能

类似 Trello/Jira 的任务协作平台, 支持项目/任务/标签/成员管理

- **项目空间**: 项目 CRUD / 归档 / 成员管理 (z-ctc 用户镜像)
- **看板协作**: 看板 → 列表 → 任务卡片, 拖拽排序 (position)
- **任务管理**: 优先级/状态/截止日期/多人执行者/标签
- **统一鉴权**: z-ctc 4A SSO (SsoInterceptor, JWT Cookie)

详细功能特性详见各子模块 README 或源码注释。

---

## 🏗️ 项目结构

```
z-task/
├── pom.xml                      # 根 POM (引用 z-opc 父项目)
├── README.md                    # 本文档
├── MODULE_NOTE.md               # 来源说明 (从 z-opc 拆分)
```

子模块列表:

| 模块 | 职责 |
|------|------|
| `z-task-core/` | 任务/项目/标签/成员业务核心 |
| `_frontend/` | 前端 (React/Vue) |
| `z-task-web/` | Web 控制层 + 静态资源 |
| `z-task-starter/` | Spring Boot 启动模块 |

---

## 🔧 技术栈

- Java 8 + Spring Boot 2.7.12 (依赖版本由 z-boot-dependencies BOM 锁定)
- MyBatis Plus 3.5.7 + Druid (z-boot-datasource-starter, 配置键 `z.base.db.task.*`)
- z-ctc-web (4A SSO 统一鉴权)
- React 19 + Ant Design 6 + Vite 6 (复用 @yuku123/z-frontend-common)
- MySQL 8.0

---

## 🚀 快速开始

### 前置条件

- JDK 8+ (推荐 JDK 17)
- Maven 3.6+
- 端口 `8082` 未被占用
- MySQL 可达 (连接配置见 `z-task-starter/src/main/resources/application.yml`, 敏感项走环境变量
  `ZTASK_DB_HOST/PORT/NAME/USER/PASSWORD`)

### 编译

```bash
# 在 z-opc-foundation 仓内编译 (父 POM 位于仓根)
cd /Users/zifang/workplace/ceo_workplace/z-opc-foundation/z-task
mvn clean compile

# 仅后端测试 (决策层单测, 零 DB 依赖)
mvn test -pl z-task-core
```

### 运行

```bash
# 启动主服务 (根据项目类型选择)
mvn -pl <启动模块> spring-boot:run
# 或
java -jar <启动模块>/target/*.jar
```

---

## 📦 模块说明

z-task 由以下子模块组成:

| `z-task-core/` | 任务/项目/标签/成员业务核心 |
| `_frontend/` | 前端 (React/Vue) |
| `z-task-web/` | Web 控制层 + 静态资源 |
| `z-task-starter/` | Spring Boot 启动模块 |

各模块职责详见各子目录下的 `pom.xml` 和源码。

---

## 🧪 测试

```bash
mvn test
```

测试覆盖:
- 单元测试: z-task-core 决策层服务 (TaskService/TaskListService/ProjectBizService), 37 例,
  JDK 动态代理 + 内存 Map 模拟 Mapper, 零 Mockito 零 DB 依赖

---

## 🔌 API 接口

API 接口定义在各子模块的 `controller` 包下。

启动后访问 `http://localhost:3006/swagger-ui.html` 或 `/doc.html` (knife4j) 查看完整 API 文档。

---

## 🐳 部署

### Docker

```bash
# 构建镜像
docker build -t z-task:latest .

# 运行容器 (容器内 8080, 宿主映射 8082, 见 _doc/003_script/build.sh)
docker run -d -p 8082:8080 --name z-task z-task:latest
```

### 配置

主要配置文件:
- `application.yml` - Spring Boot 配置
- `logback.xml` - 日志配置
- 环境变量: `JAVA_OPTS`, `SPRING_PROFILES_ACTIVE`

---

## 📚 相关文档

- [MODULE_NOTE.md](./MODULE_NOTE.md) - 从 z-opc 拆分说明
- [z-opc 父项目](https://github.com/yuku123/z-opc) - 完整源码

---

## ⚠️ 已知风险

| 级别 | 内容 |
|------|------|
| P1 | `/api/sync-user/**` 在 SSO exclude-paths 中**免鉴权** (服务端用户同步端点, 无 service token 机制); 独立部署时勿将该端口暴露公网 |
| P2 | DB 连接走 `z.base.db.task.*`, 未配置时回退 `127.0.0.1:3306/root` (启动成功但业务接口不可用) |

---

## 📝 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.1 | 2026-09-24 | 对齐 z-boot 家族标准架构: 配置去明文凭证改环境变量, 删除死配置 spring.datasource, TaskController 迁移 api/ DTO 风格, SQL 三方漂移收口为权威 schema.sql, 补 37 例决策层单测, 清理 createTask DEBUG 残留 |
| 1.0.0 | 2026-09-06 | 从 z-opc monorepo 拆分独立仓, 文档补齐 |

---

## 📄 License

Internal use only. 版权属于 z-biz。

_Maintained by z-opc-foundation organization._


## 文档目录

本项目文档统一收口在 `_doc/` 下:

- [`_doc/001_arch/`](_doc/001_arch/) — 架构文档 (项目总览 / 模块结构 / 接口清单 / DB schema / 前端 / 能力 / roadmap):
  - [`00-overview.md`](_doc/001_arch/00-overview.md)
  - [`01-module-structure-2.md`](_doc/001_arch/01-module-structure-2.md)
  - [`01-module-structure.md`](_doc/001_arch/01-module-structure.md)
  - [`02-feature.md`](_doc/001_arch/02-feature.md)

- [`_doc/003_script/`](_doc/003_script/) — 运维脚本:
  - [`build.sh`](_doc/003_script/build.sh)
  - [`package.sh`](_doc/003_script/package.sh)
  - [`start.sh`](_doc/003_script/start.sh)

各文档详细说明见各子目录。
