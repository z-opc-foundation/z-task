import {sameId, type Id} from "../../utils/id";
import { TeamOutlined } from "@ant-design/icons";
import { Button, Empty, Input, message, Segmented, Spin } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {DEFAULT_STATUS_COLUMNS, parseStatusColumns, reorderTodoItemsBatch, reorderTodoProjectsBatch, updateTodoProject, type TodoItemPayload, type TodoItemView, type TodoPriority, type TodoProjectBundle, type TodoProjectSummary, type TodoStatus, type TodoStatusColumn} from "../../services/todo-api";
import {completeTodoItem, fetchTodoItems, fetchTodoProjects, reopenTodoItem, reorderTodoItem, updateTodoItem} from "../../services/todo-api";
import { useAppStore } from "../../store/useAppStore";
import styles from "./index.module.css";
import TodoAddModal, { type TodoAddPreset } from "./TodoAddModal";
import TodoColumnModal, { type TodoColumnPreset } from "./TodoColumnModal";
import TodoDetailDrawer from "./TodoDetailDrawer";
import TodoList from "./TodoList";
import TodoProjectMembersModal from "./TodoProjectMembersModal";
import TodoSidebar from "./TodoSidebar";

/** 事项拖拽 MIME（TodoList 发起，TodoSidebar 接收） */
export const DRAG_ITEM_MIME = "application/x-ft-todo-item";

/** 看板列整体拖拽 MIME（列头排序，仅 TodoList 内部使用） */
export const DRAG_COLUMN_MIME = "application/x-ft-todo-column";

/** 当前选中视图 */
export type ViewSel =
  | { type: "view"; key: "today" | "week" | "all" | "assigned" | "completed" }
  | { type: "inbox" }
  | { type: "project"; id: Id };

export type GroupBy = "status" | "priority" | "assignee" | "project" | "none";

export interface TodoTabProps {
  /** 打开群聊项目（场景实例） */
  onOpenProject: (projectId: string) => void;
  /** 打开个人笔记中的指定笔记 */
  onOpenNote: (noteId: Id) => void;
  /** 打开某条待办绑定的 Agent 会话（宿主壳能路由到单聊才传；缺省时详情抽屉不显示「打开会话」按钮） */
  onOpenAgentSession?: (sessionId: Id, agentId: Id) => void;
  /** 外部指定打开的事项（跨 Tab 跳转，如个人笔记），ts 变化保证重复跳转也触发 */
  openTodoId?: { id: Id; ts: number } | null;
}

const VIEW_TITLES: Record<string, string> = {
  today: "今天",
  week: "最近 7 天",
  all: "全部事项",
  assigned: "指派给我的",
  completed: "已完成",
  inbox: "收集箱",
};

export const STATUS_LABEL: Record<string, string> = {
  TODO: "待办",
  DOING: "进行中",
  DONE: "已完成",
  ARCHIVED: "已归档",
};

export const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

/** 优先级组名 → 优先级值（跨组拖拽改字段用） */
const PRIORITY_VALUE: Record<string, TodoPriority> = {
  "优先级：高": "HIGH",
  "优先级：中": "MEDIUM",
  "优先级：低": "LOW",
};

/** 组排序基数：组间固定序在「不分组」视图下依旧成立 */
const GROUP_SORT_BASE = 1_000_000;

/** 所有可见项目（含 owner 与成员姓名映射） */
export interface TodoProjectContext {
  byId: Map<Id, TodoProjectSummary>;
  /** userId → 姓名 */
  userNameById: Map<string, string>;
  /** 状态 key → 显示名（内置 + 各项目自定义状态并集，用于全局/收集箱视图回显） */
  statusLabelByKey: Map<string, string>;
}

/** 状态显示名：项目配置 label 优先，内置默认兜底，均无为裸 key */
export function resolveStatusLabel(
  status: string,
  projectCtx: TodoProjectContext
): string {
  return (
    projectCtx.statusLabelByKey.get(status) ?? STATUS_LABEL[status] ?? status
  );
}

/**
 * 指派人展示列表。
 *
 * 后端只有一个指派人：TodoItem.java:95 是 `private String assigneeUserId`，
 * TodoController:174/197 也只读 assigneeUserId。`assigneeUserIds`（复数）和
 * `assignees`（带姓名的数组）在 z-team 全仓零命中，后端从不返回。
 *
 * 原写法 `item.assigneeUserIds.length > 0 ? ... : ...` 会在每个待办项上求值
 * `undefined.length` → TypeError，而本函数被 TodoList.tsx:561 与
 * TodoDetailDrawer.tsx:239 两个渲染路径调用，整张待办列表连同详情抽屉一起崩。
 * 姓名只能走项目成员映射回退（后端那份 assignees 本来就不存在）。
 */
export function resolveAssignees(
  item: TodoItemView,
  projectCtx: TodoProjectContext
): Array<{ userId: string; name: string }> {
  const ids = item.assigneeUserId ? [item.assigneeUserId] : [];
  return ids.map((userId) => ({
    userId,
    name: projectCtx.userNameById.get(userId) ?? userId,
  }));
}

/** 项目显示名：后端 projectTitle 优先，退化到本地项目映射，收集箱为「收集箱」 */
export function resolveProjectTitle(
  item: TodoItemView,
  projectCtx: TodoProjectContext
): string {
  // 收集箱哨兵是 "0"。ID 变字符串后写成 === 0 会恒为 false（"0" === 0 是 false），
  // 收集箱里的待办会被错标成某个项目。
  if (item.projectId == null || item.projectId === INBOX_PROJECT_ID) return "收集箱";
  // 项目名只能来自项目上下文：normalizeTodoItem 不产出 projectTitle，
  // 后端 TodoItem 实体也没有该列（只有 projectId），原 `?? item.projectTitle`
  // 恒为 undefined，属幻觉兜底。删掉后由 projectId 兜底。
  return projectCtx.byId.get(item.projectId)?.title ?? String(item.projectId);
}

/** 项目分组组名：p:<projectId> / inbox（收集箱） */
const PROJECT_GROUP_INBOX = "inbox";
/** 收集箱哨兵。后端按 project_id=0 取收集箱，query 序列化后同样是 0。 */
export const INBOX_PROJECT_ID: Id = "0";

function projectGroupKey(item: TodoItemView): string {
  return item.projectId != null ? `p:${item.projectId}` : PROJECT_GROUP_INBOX;
}

/**
 * 分组：groupBy → [组名, 事项[]][]（保持稳定展示顺序；与拖拽落库共用）。
 * status 分组的组名即状态 key（内置/自定义），避免 label 重名歧义；
 * statusColumns 决定状态组顺序（未配置的自定义状态排在配置列之后）。
 */
export function buildTodoGroups(
  topItems: TodoItemView[],
  groupBy: GroupBy,
  projectCtx: TodoProjectContext,
  statusColumns?: TodoStatusColumn[]
): [string, TodoItemView[]][] {
  if (groupBy === "none") {
    return [["全部", topItems]];
  }
  const map = new Map<string, TodoItemView[]>();
  for (const item of topItems) {
    let key: string;
    if (groupBy === "status") key = item.status;
    else if (groupBy === "priority")
      key = `优先级：${PRIORITY_LABEL[item.priority] ?? item.priority}`;
    else if (groupBy === "project") key = projectGroupKey(item);
    else {
      key = item.assigneeUserId
        ? `指派给：${
            projectCtx.userNameById.get(item.assigneeUserId) ??
            item.assigneeUserId
          }`
        : "未指派";
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  // 排序组：状态按看板列配置序；优先级（高>中>低）；项目按侧栏序（收集箱最后）；指派人保持插入序
  const entries = Array.from(map.entries());
  if (groupBy === "status") {
    const order = (statusColumns ?? DEFAULT_STATUS_COLUMNS).map((c) =>
      String(c.status)
    );
    entries.sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia < 0 ? order.length : ia) - (ib < 0 ? order.length : ib);
    });
  } else if (groupBy === "priority") {
    entries.sort(
      (a, b) =>
        ["优先级：高", "优先级：中", "优先级：低", "未指派"].indexOf(a[0]) -
        ["优先级：高", "优先级：中", "优先级：低", "未指派"].indexOf(b[0])
    );
  } else if (groupBy === "project") {
    // projectCtx.byId 插入序 = 侧栏 owned+joined 展示序；收集箱固定最后
    const projectOrder = Array.from(projectCtx.byId.keys());
    // FE-PRECISION-FIX: 不能 Number() 分组名里的 ID，按字符串 key 精确匹配
    const orderOf = (key: string) =>
      key === PROJECT_GROUP_INBOX
        ? Number.MAX_SAFE_INTEGER
        : projectOrder.indexOf(key.slice(2));
    entries.sort((a, b) => orderOf(a[0]) - orderOf(b[0]));
  }
  return entries;
}

/** 事项所属组名（跨组拖拽判定用）；status 分组组名即状态 key */
function groupOf(
  item: TodoItemView,
  groupBy: GroupBy,
  projectCtx: TodoProjectContext
): string {
  if (groupBy === "status") return item.status;
  if (groupBy === "priority")
    return `优先级：${PRIORITY_LABEL[item.priority] ?? item.priority}`;
  if (groupBy === "project") return projectGroupKey(item);
  if (groupBy === "assignee")
    return item.assigneeUserId
      ? `指派给：${
          projectCtx.userNameById.get(item.assigneeUserId) ??
          item.assigneeUserId
        }`
      : "未指派";
  return "全部";
}

/** 目标组名 → 字段变更（跨组拖拽语义） */
function groupValuePatch(
  groupBy: GroupBy,
  targetGroupName: string,
  targetItems: TodoItemView[]
): TodoItemPayload | null {
  if (groupBy === "status") {
    // 组名即状态 key（内置/自定义均直接生效）
    return targetGroupName ? { status: targetGroupName as TodoStatus } : null;
  }
  if (groupBy === "priority") {
    const v = PRIORITY_VALUE[targetGroupName];
    return v ? { priority: v } : null;
  }
  if (groupBy === "assignee") {
    // 兼容后端旧字段：同时下发单值与列表
    if (targetGroupName === "未指派")
      return { assigneeUserId: "", assigneeUserIds: [] };
    const first = targetItems[0];
    return first?.assigneeUserId
      ? {
          assigneeUserId: first.assigneeUserId,
          assigneeUserIds: [first.assigneeUserId],
        }
      : null;
  }
  if (groupBy === "project") {
    if (targetGroupName === PROJECT_GROUP_INBOX) return { projectId: INBOX_PROJECT_ID };
    // FE-PRECISION-FIX: ID 是 19 位字符串，分组名不能只按 \d+ 匹配
    const m = /^p:(.+)$/.exec(targetGroupName);
    return m ? { projectId: m[1] } : null;
  }
  return null;
}

export default function TodoTab({
  onOpenProject,
  onOpenNote,
  onOpenAgentSession,
  openTodoId,
}: TodoTabProps) {
  const token = useAppStore((s) => s.token);
  const currentUser = useAppStore((s) => s.currentUser);
  const [bundle, setBundle] = useState<TodoProjectBundle | null>(null);
  const [items, setItems] = useState<TodoItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewSel>({ type: "view", key: "today" });
  /** 输入框即时值（防抖前） */
  const [keywordInput, setKeywordInput] = useState("");
  /** 已应用的搜索词 */
  const [keyword, setKeyword] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [detailId, setDetailId] = useState<Id | null>(null);
  /** 深链打开详情时暂存事项（避免当前视图过滤导致抽屉打不开） */
  const [pinnedDetailItem, setPinnedDetailItem] = useState<TodoItemView | null>(
    null
  );
  /** 新建事项弹窗（列内 ＋ 入口） */
  const [addOpen, setAddOpen] = useState(false);
  const [addPreset, setAddPreset] = useState<TodoAddPreset>({});
  /** 项目成员管理弹窗 */
  const [membersOpen, setMembersOpen] = useState(false);
  /** 收集箱顶层事项数（侧栏徽标，独立于当前视图拉取） */
  const [inboxCount, setInboxCount] = useState(0);
  /** 拖拽落库串行化（防抖动期间重复提交） */
  const droppingRef = useRef(false);
  /**
   * 「完成/撤销」防连点：按事项 id 记录进行中 + 上次成功切换的时刻。
   *
   * ⚠ 为什么需要**两道**闸（第 17 轮 K1 实测踩坑）：
   *   ① in-flight（请求在飞时忽略）：挡住「两次点击都落在请求在飞期间」。
   *   ② cooldown（成功后一段时间内忽略）：挡不住**响应很快**的情况 ——
   *      勾选框是**受控**的，状态只在请求返回后才更新；
   *      而线上响应可能只要几十毫秒 ⇒ 第二次点击时状态已经变成 DONE
   *      ⇒ 于是发出「complete 一次 + reopen 一次」⇒
   *      **净效果是「用户以为标记完成，结果又变回未完成」**。
   *      ⇒ 成功切换后的一小段时间内，同一事项的再次点击一律忽略（手抖双击只算一次）。
   */
  const TOGGLE_COOLDOWN_MS = 600;
  const togglingRef = useRef<Set<string>>(new Set());
  const lastToggleAtRef = useRef<Map<string, number>>(new Map());

  const loadItems = useCallback(
    async (sel: ViewSel, kw: string) => {
      const query: Parameters<typeof fetchTodoItems>[0] = { view: "all" };
      if (sel.type === "view") query.view = sel.key;
      if (sel.type === "inbox") query.projectId = INBOX_PROJECT_ID;
      if (sel.type === "project") query.projectId = sel.id;
      if (kw.trim()) query.keyword = kw.trim();
      const list = await fetchTodoItems(query, token);
      setItems(list);
    },
    [token]
  );

  const refreshBundle = useCallback(async () => {
    const b = await fetchTodoProjects(token);
    setBundle(b);
    return b;
  }, [token]);

  const loadInboxCount = useCallback(async () => {
    try {
      const list = await fetchTodoItems({ view: "all", projectId: INBOX_PROJECT_ID }, token);
      setInboxCount(list.filter((i) => !i.parentId).length);
    } catch {
      /* 徽标失败静默 */
    }
  }, [token]);

  /** 静默刷新（拖拽等操作后校准，不打 loading） */
  const silentRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refreshBundle(),
        loadItems(view, keyword),
        loadInboxCount(),
      ]);
    } catch {
      /* 忽略 */
    }
  }, [refreshBundle, loadItems, loadInboxCount, view, keyword]);

  const reload = useCallback(
    async (sel: ViewSel = view, kw: string = keyword) => {
      setLoading(true);
      try {
        await Promise.all([
          refreshBundle(),
          loadItems(sel, kw),
          loadInboxCount(),
        ]);
      } catch {
        message.error("加载工作待办失败");
      } finally {
        setLoading(false);
      }
    },
    [view, keyword, refreshBundle, loadItems, loadInboxCount]
  );

  useEffect(() => {
    // 归档性视图（今天/最近/全部/指派给我/已完成）默认按项目两级列表；项目视图/收集箱默认按状态看板
    setGroupBy(view.type === "view" ? "project" : "status");
    reload(view, keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  /** 搜索防抖：输入停顿 300ms 后再查询 */
  useEffect(() => {
    if (keywordInput === keyword) return;
    const t = setTimeout(() => {
      setKeyword(keywordInput);
      loadItems(view, keywordInput).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInput]);

  /** 个人笔记等外部深链：打开指定事项详情 */
  useEffect(() => {
    if (!openTodoId?.id) return;
    const targetId = openTodoId.id;
    setDetailId(targetId);
    let cancelled = false;
    void (async () => {
      try {
        const all = await fetchTodoItems({ view: "all" }, token);
        if (cancelled) return;
        const target = all.find((i) => i.id === targetId) ?? null;
        if (target) {
          setPinnedDetailItem(target);
          if (target.projectId != null) {
            setView({ type: "project", id: target.projectId });
          } else {
            setView({ type: "inbox" });
          }
        }
        setItems(all);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTodoId?.id, openTodoId?.ts]);

  /** 项目上下文：id→项目、userId→姓名、状态 key→显示名（各项目自定义状态并集） */
  const projectCtx: TodoProjectContext = useMemo(() => {
    const byId = new Map<Id, TodoProjectSummary>();
    const userNameById = new Map<string, string>();
    const statusLabelByKey = new Map<string, string>();
    const all = [...(bundle?.owned ?? []), ...(bundle?.joined ?? [])];
    for (const p of all) {
      byId.set(p.id, p);
      if (p.createByName) userNameById.set(p.userId, p.createByName);
      for (const m of p.memberDetails ?? []) {
        userNameById.set(m.userId, m.userName);
      }
      for (const col of parseStatusColumns(p.extraInfo)) {
        if (!statusLabelByKey.has(col.status)) {
          statusLabelByKey.set(col.status, col.label);
        }
      }
    }
    return { byId, userNameById, statusLabelByKey };
  }, [bundle]);

  /** 当前视图归属项目（快速添加默认归属；@指派候选来源） */
  const currentProject: TodoProjectSummary | null = useMemo(() => {
    if (view.type !== "project") return null;
    return projectCtx.byId.get(view.id) ?? null;
  }, [view, projectCtx]);

  /** 当前用户 FT userId（口径与 team member ref_id 一致，取 currentUser.id） */
  const myUserId = useMemo(
    () =>
      (currentUser?.id != null && String(currentUser.id)) ||
      bundle?.owned?.[0]?.userId ||
      items.find((i) => i.projectId == null)?.userId ||
      "",
    [currentUser, bundle, items]
  );

  /**
   * 当前视图生效的看板列配置：项目视图取项目空间扩展信息里的 statusColumns，
   * 收集箱/归档性视图用默认列（数据中出现的其他状态由 TodoList 作为兜底列追加）。
   */
  const statusColumns: TodoStatusColumn[] = useMemo(() => {
    if (currentProject) return parseStatusColumns(currentProject.extraInfo);
    return DEFAULT_STATUS_COLUMNS;
  }, [currentProject]);

  /** 是否当前项目 owner（仅 owner 可管理看板列配置） */
  const isProjectOwner = !!currentProject && currentProject.userId === myUserId;

  /**
   * 保存看板列配置。
   *
   * 2026-10-04 实装。此前这里是「弹 warning 说后端没这字段」——
   * 起因是前端早就支持自定义看板列（读取走 parseStatusColumns(currentProject.extraInfo)，
   * updateTodoProject 的 body 里也早有 extraInfo），但后端 TodoProject 实体与
   * z_team_todo_project 表都没有对应列，updateProject 是五字段白名单，
   * 传进来的 extraInfo 被静默丢弃 ⇒ 保存必不生效且不报错。
   *
   * 现在后端已补（迁移 migration_z_team_todo_project_extra_info.sql + 实体 extraInfo
   * + updateProject 读取 + 列表返回），这里改成真实存取。
   *
   * 存完必须 refreshBundle()：statusColumns 是从 projectCtx.byId 派生的 useMemo，
   * 本地 state 不动的话列配置要等下次整页刷新才可见。
   */
  const saveStatusColumns = useCallback(
    async (cols: TodoStatusColumn[]) => {
      if (!currentProject) return;
      try {
        await updateTodoProject(currentProject.id, {
          extraInfo: JSON.stringify({ statusColumns: cols }),
        });
        await refreshBundle();
        message.success("看板列已保存");
      } catch (error) {
        console.error("保存看板列失败:", error);
        message.error("保存看板列失败");
        // 刻意不往上抛：四个调用方（新增/重命名/删除/排序）都只是 await 之后
        // 不再做别的事，没有一处 try/catch，抛上去只会变成未处理的 promise rejection。
        // 失败已由 message.error 报给用户，这里就地终止即可。
      }
    },
    [currentProject, refreshBundle]
  );

  /** 看板列弹窗（新增/重命名共用）：preset 为空 = 新增 */
  const [columnModal, setColumnModal] = useState<TodoColumnPreset | null>(null);

  /** 新增列：内置未占用状态直接加入；自定义状态生成 C_ 前缀 key */
  const handleAddColumn = async (col: TodoStatusColumn) => {
    // 新列插到「已完成」列之前（无 DONE 列则追加末尾），保持完成列在最后
    const cols = [...statusColumns];
    const doneIdx = cols.findIndex((c) => c.status === "DONE");
    if (doneIdx >= 0) cols.splice(doneIdx, 0, col);
    else cols.push(col);
    await saveStatusColumns(cols);
  };

  /** 重命名列（label 维度，状态 key 不变） */
  const handleRenameColumn = async (status: string, label: string) => {
    await saveStatusColumns(
      statusColumns.map((c) =>
        String(c.status) === status ? { ...c, label } : c
      )
    );
  };

  /** 删除列：列内还有事项（含子事项）时拒绝（防止状态悬空） */
  const handleDeleteColumn = async (status: string) => {
    const inUse = items.some((i) => i.status === status);
    if (inUse) {
      message.warning("该列还有事项，请先移出或完成后再删除");
      return;
    }
    await saveStatusColumns(
      statusColumns.filter((c) => String(c.status) !== status)
    );
  };

  /**
   * 列整体拖拽排序：orderedKeys 为看板可见列的新顺序（含未配置的兜底列）。
   * 兜底列首次参与排序时物化进配置（label 取解析后的显示名），之后可正常重命名。
   */
  const handleMoveColumn = async (orderedKeys: string[]) => {
    const byKey = new Map(statusColumns.map((c) => [String(c.status), c]));
    const next: TodoStatusColumn[] = orderedKeys.map(
      (k) =>
        byKey.get(k) ?? {
          status: k as TodoStatus,
          label: resolveStatusLabel(k, projectCtx),
        }
    );
    const unchanged =
      next.length === statusColumns.length &&
      next.every(
        (c, i) => String(c.status) === String(statusColumns[i].status)
      );
    if (unchanged) return;
    await saveStatusColumns(next);
  };

  const headerTitle = useMemo(() => {
    if (view.type === "project") {
      const p = projectCtx.byId.get(view.id);
      return p ? `${p.icon ? `${p.icon} ` : ""}${p.title}` : "项目";
    }
    return VIEW_TITLES[view.type === "view" ? view.key : "inbox"];
  }, [view, projectCtx]);

  /** 列内 ＋ 新建：按分组列名预设字段（状态/优先级/指派人）；状态组名即状态 key */
  const handleOpenAddInGroup = (groupName: string | null) => {
    const preset: TodoAddPreset = {};
    if (groupName != null && groupBy === "status") {
      preset.status = groupName as TodoStatus;
    } else if (groupName != null && groupBy === "priority") {
      const v = PRIORITY_VALUE[groupName];
      if (v) preset.priority = v;
    } else if (groupName != null && groupBy === "assignee") {
      const hit = Array.from(projectCtx.userNameById.entries()).find(
        ([, n]) => `指派给：${n}` === groupName
      );
      if (hit) preset.assigneeUserIds = [hit[0]];
    } else if (groupName != null && groupBy === "project") {
      if (groupName === PROJECT_GROUP_INBOX) {
        preset.projectId = INBOX_PROJECT_ID;
      } else {
        // FE-PRECISION-FIX: ID 是 19 位字符串，分组名不能只按 \d+ 匹配
        const m = /^p:(.+)$/.exec(groupName);
        if (m) preset.projectId = m[1];
      }
    }
    setAddPreset(preset);
    setAddOpen(true);
  };

  /** 行内完成/重开（局部替换避免闪烁） */
  const handleToggle = async (item: TodoItemView) => {
    // ⚠ 同一条事项：请求在飞 ⇒ 忽略；刚成功切换过（冷却窗口内）⇒ 忽略
    //   （只加 in-flight 闸不够：响应快时第二次点击会变成「撤销」，净效果归零）
    const key = String(item.id);
    if (togglingRef.current.has(key)) return;
    const last = lastToggleAtRef.current.get(key);
    if (last != null && Date.now() - last < TOGGLE_COOLDOWN_MS) return;
    togglingRef.current.add(key);
    try {
      const updated =
        item.status === "DONE"
          ? await reopenTodoItem(item.id, token)
          : await completeTodoItem(item.id, "", token);
      setItems((prev) => prev.map((i) => (sameId(i.id, updated.id) ? updated : i)));
      // 只在**成功**后记冷却时刻（失败要允许用户重试）
      lastToggleAtRef.current.set(key, Date.now());
      refreshBundle().catch(() => {});
      loadInboxCount().catch(() => {});
    } catch {
      message.error("操作失败");
    } finally {
      togglingRef.current.delete(key);
    }
  };

  /**
   * 列表内拖拽落库：同组重排 + 跨组改字段。
   * 全视图顶层事项按「组序基数 + 组内序」重编，保证分组/不分组视图顺序一致。
   */
  const handleItemDropped = async (
    itemId: Id,
    groupName: string | null,
    insertIndex: number
  ) => {
    if (droppingRef.current) return;
    const dragged = items.find((i) => i.id === itemId);
    if (!dragged) return;
    const topItems = items.filter((i) => !i.parentId);
    const groups = buildTodoGroups(
      topItems,
      groupBy,
      projectCtx,
      statusColumns
    );
    // 看板空列不在分组结果里，补空组使落库逻辑继续
    const entry =
      groupName == null
        ? (["全部", topItems] as [string, TodoItemView[]])
        : groups.find(([n]) => n === groupName) ??
          ([groupName, []] as [string, TodoItemView[]]);
    if (!entry) return;
    const groupItems = entry[1];

    // 计算目标组新顺序（insertIndex 相对当前渲染序列，移除自身后校正）
    const fromIdx = groupItems.findIndex((i) => i.id === itemId);
    const list = [...groupItems];
    let insert = insertIndex;
    if (fromIdx >= 0) {
      list.splice(fromIdx, 1);
      if (fromIdx < insert) insert -= 1;
    }
    insert = Math.max(0, Math.min(insert, list.length));
    list.splice(insert, 0, dragged);

    // 跨组 → 字段变更
    let patch: TodoItemPayload | null = null;
    if (groupBy !== "none" && groupName != null) {
      const srcGroup = groupOf(dragged, groupBy, projectCtx);
      if (srcGroup !== groupName) {
        patch = groupValuePatch(groupBy, groupName, groupItems);
        if (!patch) return; // 目标组字段值无法确定，放弃本次拖拽
      }
    }
    if (!patch && fromIdx === insert) return;

    droppingRef.current = true;
    try {
      // 乐观更新字段（排序由 silentRefresh 校准）
      if (patch) {
        setItems((prev) =>
          prev.map((i) => (sameId(i.id, itemId) ? { ...i, ...patch } : i))
        );
        await updateTodoItem(itemId, patch, token);
      }
      // 重编全视图顶层事项：组序基数 + 组内序 × 10（留插入空间）
      // 非目标组需排除被拖项：跨组时它会同时出现在原组序列，后写会覆盖新位置序号
      const updates: Array<{ id: Id; sortOrder: number }> = [];
      groups.forEach(([name, gItems], gi) => {
        const ordered =
          name === groupName ? list : gItems.filter((it) => it.id !== itemId);
        const base =
          groupBy === "none" || groupName == null ? 0 : gi * GROUP_SORT_BASE;
        ordered.forEach((it, idx) => {
          updates.push({ id: it.id, sortOrder: base + idx * 10 });
        });
      });
      if (updates.length > 0) {
        await reorderTodoItemsBatch(updates, token);
      }
      await silentRefresh();
    } catch {
      message.error("调整顺序失败");
      await silentRefresh();
    } finally {
      droppingRef.current = false;
    }
  };

  /** 侧栏拖入项目/收集箱（跨项目移动） */
  const handleItemMovedToProject = async (
    itemId: Id,
    projectId: string
  ) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    // FE-PRECISION-FIX: 收集箱哨兵在字符串 ID 下是 "0"，写成 ?? 0 会恒不相等
    if (sameId(item.projectId, projectId)) return;
    try {
      await reorderTodoItem(itemId, { projectId }, token);
      message.success(projectId === INBOX_PROJECT_ID ? "已移入收集箱" : "已移动到项目");
      await silentRefresh();
    } catch {
      message.error("移动失败");
    }
  };

  /** 侧栏项目拖拽排序 */
  const handleProjectsReordered = async (orderedIds: Id[]) => {
    if (orderedIds.length === 0) return;
    try {
      await reorderTodoProjectsBatch(
        orderedIds.map((id, idx) => ({ id, sortOrder: (idx + 1) * 10 })),
        token
      );
    } catch {
      message.error("项目排序失败");
    }
    refreshBundle().catch(() => {});
  };

  /** 详情抽屉内变更后回调：刷新列表与项目计数 */
  const handleDetailChanged = async () => {
    await reload();
  };

  const detailItem = useMemo(() => {
    if (detailId == null) return null;
    const fromList = items.find((i) => i.id === detailId);
    if (fromList) return fromList;
    if (pinnedDetailItem?.id === detailId) return pinnedDetailItem;
    return null;
  }, [items, detailId, pinnedDetailItem]);

  /** 搜索模式：平铺展示匹配项（含子事项，不分组） */
  const flat = !!keyword.trim();

  /** 空态判定：搜索模式看全部匹配，否则看顶层事项 */
  const emptyCount = useMemo(
    () => (flat ? items.length : items.filter((i) => !i.parentId).length),
    [items, flat]
  );

  return (
    <div className={styles.container}>
      <TodoSidebar
        bundle={bundle}
        view={view}
        onViewChange={setView}
        onReload={() => reload()}
        inboxCount={inboxCount}
        onItemDroppedToProject={handleItemMovedToProject}
        onProjectsReordered={handleProjectsReordered}
        onManageMembers={(projectId) => {
          // 右键菜单「成员管理」：切到该项目视图（成员弹窗绑定 currentProject）后打开
          setView({ type: "project", id: projectId });
          setMembersOpen(true);
        }}
      />

      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>{headerTitle}</h2>
            {currentProject?.visibility === "shared" && (
              <div className={styles.headerSubtitle}>
                共享项目 · owner{" "}
                {currentProject.createByName ?? currentProject.userId}
              </div>
            )}
          </div>
          {currentProject && (
            <Button
              size="small"
              className={styles.headerMembers}
              icon={<TeamOutlined />}
              onClick={() => setMembersOpen(true)}
              title="管理项目成员（添加后对方可见并协作）"
            >
              成员 · {1 + (currentProject.memberDetails?.length ?? 0)}
            </Button>
          )}
        </div>

        {/* 工具栏 */}
        <div className={styles.toolbar}>
          <Segmented
            size="small"
            className={styles.groupSeg}
            value={groupBy}
            onChange={(v) => setGroupBy(v as GroupBy)}
            options={[
              ...(view.type === "view"
                ? [{ label: "按项目", value: "project" }]
                : []),
              { label: "按状态", value: "status" },
              { label: "按优先级", value: "priority" },
              { label: "按指派人", value: "assignee" },
              { label: "列表", value: "none" },
            ]}
          />
          <div className={styles.toolbarSpacer} />
          <Input
            className={styles.toolbarSearch}
            size="small"
            allowClear
            placeholder="搜索事项标题"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
        </div>

        {/* 列表：搜索无结果出「没有匹配的事项」；零数据出「还没有任何事项」 */}
        <div className={styles.listScroll}>
          {loading ? (
            <div className={styles.emptyWrap}>
              <Spin />
            </div>
          ) : flat && emptyCount === 0 ? (
            <div className={styles.emptyWrap}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="没有匹配的事项"
              />
            </div>
          ) : !flat && emptyCount === 0 ? (
            /**
             * ⚠ 零数据时的空态（第 17 轮 M1 实测补上）。
             *
             * 改之前：列表区在**一条事项都没有**时是**完全空白** ——
             *   「按项目」分组的分组来自事项本身 ⇒ 0 条 ⇒ 连一个分组都没有 ⇒
             *   整块区域只剩一个「添加事项」按钮，**没有任何文字说明**。
             *   ⇒ 用户看到一片空白，分不清是「真的没有事项」还是「加载失败」。
             *   （实测：body 里既没有「没有匹配的事项」也没有「暂无事项」，列表区 HTML
             *     只剩一个 addRow 按钮。）
             * ⇒ 现在给一句可读说明 + 保留唯一的创建入口。
             */
            <div className={styles.emptyWrap}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    还没有任何事项
                    <span className={styles.emptyHint}>
                      点击下方按钮创建第一条，或切换左侧视图查看其它事项
                    </span>
                  </span>
                }
              >
                <Button
                  type="primary"
                  onClick={() => handleOpenAddInGroup(null)}
                >
                  新建事项
                </Button>
              </Empty>
            </div>
          ) : (
            <TodoList
              items={items}
              groupBy={groupBy}
              projectCtx={projectCtx}
              flat={flat}
              hideAdd={view.type === "view" && view.key === "completed"}
              statusColumns={statusColumns}
              canManageColumns={isProjectOwner && groupBy === "status" && !flat}
              onToggle={handleToggle}
              onOpenDetail={(id) => setDetailId(id)}
              onDeleted={() => reload()}
              onItemDropped={handleItemDropped}
              onAddInGroup={handleOpenAddInGroup}
              onAddColumn={() => setColumnModal({ mode: "add" })}
              onRenameColumn={(status, label) =>
                setColumnModal({ mode: "rename", status, label })
              }
              onDeleteColumn={(status) => {
                void handleDeleteColumn(status).catch(() =>
                  message.error("删除列失败")
                );
              }}
              onMoveColumn={(keys) => {
                void handleMoveColumn(keys).catch(() =>
                  message.error("调整列顺序失败")
                );
              }}
            />
          )}
        </div>
      </div>

      {/* 新建事项弹窗（列内 ＋ 入口） */}
      <TodoAddModal
        open={addOpen}
        token={token}
        myUserId={myUserId}
        viewProject={currentProject}
        bundle={bundle}
        preset={addPreset}
        onCancel={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          silentRefresh();
        }}
      />

      {/* 看板列新增/重命名弹窗 */}
      <TodoColumnModal
        preset={columnModal}
        columns={statusColumns}
        onCancel={() => setColumnModal(null)}
        onSubmit={async (col) => {
          try {
            if (columnModal?.mode === "rename" && columnModal.status) {
              await handleRenameColumn(columnModal.status, col.label);
            } else {
              await handleAddColumn(col);
            }
            setColumnModal(null);
          } catch {
            message.error("保存看板列失败");
          }
        }}
      />

      {/* 项目成员管理弹窗 */}
      <TodoProjectMembersModal
        open={membersOpen}
        token={token}
        project={currentProject}
        myUserId={myUserId}
        onClose={() => setMembersOpen(false)}
        onChanged={() => refreshBundle().catch(() => {})}
      />

      {/* 详情抽屉 */}
      {detailItem && (
        <TodoDetailDrawer
          item={detailItem}
          allItems={items}
          projectCtx={projectCtx}
          bundle={bundle}
          token={token}
          myUserId={myUserId}
          onClose={() => {
            setDetailId(null);
            setPinnedDetailItem(null);
          }}
          onChanged={handleDetailChanged}
          onOpenNote={onOpenNote}
          onOpenProject={onOpenProject}
          onOpenSession={onOpenAgentSession}
        />
      )}
    </div>
  );
}

/** 是否逾期（截止日早于今天） */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs(), "day");
}

/** 是否今天截止 */
export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dayjs(dueDate).isSame(dayjs(), "day");
}
