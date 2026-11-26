-- =============================================================================
-- 待办存量数据迁移：z_team (z-team 库) → z_task (z-task 库)
-- -----------------------------------------------------------------------------
-- 2026-11-02 随待办能力迁入新增。
--
-- 【迁移的三个不变量】
--   1. **id 值域逐字保留**：目标表 id 直接取源表 id，不重排、不重编。
--      理由：事项的 parent_id（父子树）、agent_session_id（Agent 会话绑定）
--      都是**软外键**，指向 id 值。重排 id ⇒ 父子关系与 Agent 会话全部失配，
--      而这两条关系没有任何重建脚本能可靠还原（会话侧在 z_team_personal_chat_session）。
--   2. **软引用不校验**：agent_id / agent_session_id 指向 z-team 侧表，
--      本脚本不 JOIN 校验 —— 两库各自独立，z-team 的表可能还没建。
--      语义解释由 z-team 侧负责。
--   3. **项目空间物理文件不搬**：目录名由 projectId 确定性推导
--      （{base-dir}/todo/{projectId}），base-dir 保持一致即天然对齐。
--      ⇒ 前置条件：z-team 与 z-task 的 workspace base-dir 指向**同一物理目录**。
--
-- 【执行前置】
--   1. 目标两表已建（z-task 的 TaskTodoSchemaPatcher 会自动建，或跑 schema.sql）。
--   2. **已切换写入**：本脚本执行期间 z-team 侧不得再写待办表。
--      稳妥做法：先停 z-team 的待办写入 → 执行本脚本 → 切 z-team 为 HTTP 代理 → 恢复。
--   3. 已备份源库（z_team）。
--
-- 【幂等】
--   用 NOT EXISTS 按 id 去重 ⇒ 可重复执行，不会产生重复行。
--   ⚠ 逻辑删除行（deleted=1）**一并迁移**：保留历史，语义与源库一致。
--
-- 【用法】
--   mysql -h<host> -u<user> -p <database> < migration_todo_from_z_team.sql
--   跨库时先 USE z_task;（若两库在同一实例上）。
-- =============================================================================

-- ------------------------------------------------------------------
-- 0. 前置检查：源表必须存在
-- ------------------------------------------------------------------
SELECT '源表 z_team_todo_project 行数' AS 检查项,
       (SELECT COUNT(*) FROM z_team.z_team_todo_project) AS 值
UNION ALL
SELECT '源表 z_team_todo_item 行数',
       (SELECT COUNT(*) FROM z_team.z_team_todo_item)
UNION ALL
SELECT '目标表 z_task_todo_project 当前行数',
       (SELECT COUNT(*) FROM z_task.z_task_todo_project)
UNION ALL
SELECT '目标表 z_task_todo_item 当前行数',
       (SELECT COUNT(*) FROM z_task.z_task_todo_item);

-- ------------------------------------------------------------------
-- 1. 项目表迁移
-- ------------------------------------------------------------------
INSERT INTO z_task.z_task_todo_project
    (id, user_id, title, icon, description, visibility, members, sort_order, extra_info,
     create_time, update_time, create_by, update_by, deleted, create_by_name, update_by_name)
SELECT
    s.id,
    s.user_id,
    s.title,
    s.icon,
    s.description,
    s.visibility,
    s.members,
    s.sort_order,
    s.extra_info,
    s.create_time,
    s.update_time,
    CAST(s.create_by AS CHAR),
    CAST(s.update_by AS CHAR),
    s.deleted,
    s.create_by_name,
    s.update_by_name
FROM z_team.z_team_todo_project s
WHERE NOT EXISTS (
    SELECT 1 FROM z_task.z_task_todo_project t WHERE t.id = s.id
);

-- ------------------------------------------------------------------
-- 2. 事项表迁移
--    ⚠ agent_id / agent_session_id 原样搬运（跨仓软外键，见文件头「不变量 2」）
-- ------------------------------------------------------------------
INSERT INTO z_task.z_task_todo_item
    (id, project_id, user_id, title, detail, status, priority, due_date, assignee_user_id,
     tags, links, parent_id, sort_order, completed_at, completed_by, agent_id, agent_session_id,
     create_time, update_time, create_by, update_by, deleted, create_by_name, update_by_name)
SELECT
    s.id,
    s.project_id,
    s.user_id,
    s.title,
    s.detail,
    s.status,
    s.priority,
    s.due_date,
    s.assignee_user_id,
    s.tags,
    s.links,
    s.parent_id,
    s.sort_order,
    s.completed_at,
    s.completed_by,
    s.agent_id,
    s.agent_session_id,
    s.create_time,
    s.update_time,
    CAST(s.create_by AS CHAR),
    CAST(s.update_by AS CHAR),
    s.deleted,
    s.create_by_name,
    s.update_by_name
FROM z_team.z_team_todo_item s
WHERE NOT EXISTS (
    SELECT 1 FROM z_task.z_task_todo_item t WHERE t.id = s.id
);

-- ------------------------------------------------------------------
-- 3. 迁移后对账
--    三个数必须逐行相等；不等说明中途有写入或漏迁，**不要**继续切流量。
-- ------------------------------------------------------------------
SELECT '项目 源 vs 目标' AS 对账项,
       (SELECT COUNT(*) FROM z_team.z_team_todo_project) AS 源,
       (SELECT COUNT(*) FROM z_task.z_task_todo_project) AS 目标,
       (SELECT COUNT(*) FROM z_team.z_team_todo_project) =
       (SELECT COUNT(*) FROM z_task.z_task_todo_project) AS 是否一致
UNION ALL
SELECT '事项 源 vs 目标',
       (SELECT COUNT(*) FROM z_team.z_team_todo_item),
       (SELECT COUNT(*) FROM z_task.z_task_todo_item),
       (SELECT COUNT(*) FROM z_team.z_team_todo_item) =
       (SELECT COUNT(*) FROM z_task.z_task_todo_item);

-- 事项级联完整性：parent_id 指向的事项必须同在目标表里（0=顶层是合法的）
SELECT '父子完整性：孤儿事项数（应为 0）' AS 检查项,
       COUNT(*) AS 值
FROM z_task.z_task_todo_item c
WHERE c.parent_id IS NOT NULL
  AND c.parent_id <> 0
  AND NOT EXISTS (
      SELECT 1 FROM z_task.z_task_todo_item p WHERE p.id = c.parent_id
  );

-- 项目归属完整性：project_id 指向的项目必须同在目标表里（NULL=收集箱是合法的）
SELECT '项目归属完整性：孤儿事项数（应为 0）' AS 检查项,
       COUNT(*) AS 值
FROM z_task.z_task_todo_item c
WHERE c.project_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM z_task.z_task_todo_project p WHERE p.id = c.project_id
  );
