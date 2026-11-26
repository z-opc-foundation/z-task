import {
  CheckSquareOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Input, message, Modal, type MenuProps } from "antd";
import { useState } from "react";
import {updateTodoProject, type TodoProjectBundle} from "../../services/todo-api";
import {createTodoProject, deleteTodoProject} from "../../services/todo-api";
import { useAppStore } from "../../store/useAppStore";
import {toId, sameId, type Id} from "../../utils/id";
import { DRAG_ITEM_MIME, INBOX_PROJECT_ID, type ViewSel } from "./index";
import styles from "./index.module.css";

/** 项目拖拽 MIME（仅侧栏内部使用） */
const DRAG_PROJECT_MIME = "application/x-ft-todo-project";

export interface TodoSidebarProps {
  bundle: TodoProjectBundle | null;
  view: ViewSel;
  onViewChange: (view: ViewSel) => void;
  onReload: () => void;
  /** 收集箱顶层事项数（独立拉取，跨视图稳定） */
  inboxCount: number;
  /** 事项拖入项目/收集箱（projectId="0" 表示收集箱） */
  onItemDroppedToProject: (itemId: Id, projectId: Id) => void;
  /** 项目拖拽排序（owned 的新顺序 id 列表） */
  onProjectsReordered: (orderedIds: Id[]) => void;
  /** 右键菜单「成员管理」：切到该项目视图并打开成员弹窗（仅 owned 项目可触发） */
  onManageMembers?: (projectId: Id) => void;
}

const VIEW_ITEMS: Array<{
  key: "today" | "week" | "all" | "assigned" | "completed";
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "today", label: "今天", icon: <ClockCircleOutlined /> },
  { key: "week", label: "最近 7 天", icon: <ClockCircleOutlined /> },
  { key: "all", label: "全部事项", icon: <CheckSquareOutlined /> },
  { key: "assigned", label: "指派给我的", icon: <UserOutlined /> },
  { key: "completed", label: "已完成", icon: <CheckSquareOutlined /> },
];

/** 包一层 span 绕过 antd 对两字中文按钮自动插空格（“取 消”） */
const BTN_CANCEL = <span>取消</span>;

export default function TodoSidebar({
  bundle,
  view,
  onViewChange,
  onReload,
  inboxCount,
  onItemDroppedToProject,
  onProjectsReordered,
  onManageMembers,
}: TodoSidebarProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  /** 项目重命名弹窗（仅 owner 项目） */
  const [renameTarget, setRenameTarget] = useState<{
    id: Id;
    title: string;
  } | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const token = useAppStore((s) => s.token);
  /** 项目拖拽：dragging 项目 id + 插入指示（owned 列表内下标） */
  const [dragProjectId, setDragProjectId] = useState<Id | null>(null);
  const [projectDropIndex, setProjectDropIndex] = useState<number | null>(null);
  /** 事项拖入高亮：目标 projectId（收集箱=INBOX_PROJECT_ID="0"） */
  const [itemDropTarget, setItemDropTarget] = useState<Id | null>(null);

  const owned = bundle?.owned ?? [];
  const joined = bundle?.joined ?? [];

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) {
      message.warning("请输入项目名");
      return;
    }
    setCreating(true);
    try {
      await createTodoProject({ title }, token);
      message.success("项目已创建");
      setCreateOpen(false);
      setNewTitle("");
      onReload();
    } catch {
      message.error("创建项目失败");
    } finally {
      setCreating(false);
    }
  };

  const isViewActive = (key: string) =>
    view.type === "view" && view.key === key;

  /** 是否有事项正在拖入（用于项目/收集箱高亮） */
  const acceptsItemDrag = (e: React.DragEvent) =>
    e.dataTransfer.types.includes(DRAG_ITEM_MIME);

  /** 是否有项目正在拖拽（用于排序指示） */
  const acceptsProjectDrag = (e: React.DragEvent) =>
    e.dataTransfer.types.includes(DRAG_PROJECT_MIME);

  /** 事项拖入项目/收集箱的统一处理 */
  const itemDropHandlers = (projectId: Id) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!acceptsItemDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setItemDropTarget(projectId);
    },
    onDragLeave: () => {
      setItemDropTarget((prev) => (prev === projectId ? null : prev));
    },
    onDrop: (e: React.DragEvent) => {
      if (!acceptsItemDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
      const id = toId(e.dataTransfer.getData(DRAG_ITEM_MIME));
      setItemDropTarget(null);
      if (id !== "") onItemDroppedToProject(id, projectId);
    },
  });

  /** 项目排序 drop：owned 列表内插入到 projectDropIndex */
  const handleProjectDrop = () => {
    if (dragProjectId == null || projectDropIndex == null) {
      resetProjectDrag();
      return;
    }
    const ids = owned.map((p) => p.id);
    const fromIdx = ids.indexOf(dragProjectId);
    if (fromIdx < 0) {
      resetProjectDrag();
      return;
    }
    const list = [...ids];
    list.splice(fromIdx, 1);
    let insert = projectDropIndex;
    if (fromIdx < insert) insert -= 1;
    insert = Math.max(0, Math.min(insert, list.length));
    // 原本是 list.splice(insert, dragProjectId) —— 把 19 位项目 ID 当成
    // deleteCount 传进 splice，会按那个天文数字截断数组，拖拽排序直接把后面的项目全删掉。
    list.splice(insert, 0, dragProjectId);
    resetProjectDrag();
    if (list.some((id, idx) => !sameId(id, ids[idx]))) {
      onProjectsReordered(list);
    }
  };

  const resetProjectDrag = () => {
    setDragProjectId(null);
    setProjectDropIndex(null);
  };

  /** 重命名项目（仅 owner；后端同样校验 owner） */
  const handleRename = async () => {
    if (!renameTarget) return;
    const title = renameTitle.trim();
    if (!title) {
      message.warning("请输入项目名");
      return;
    }
    if (title === renameTarget.title) {
      setRenameTarget(null);
      return;
    }
    setRenaming(true);
    try {
      await updateTodoProject(renameTarget.id, { title }, token);
      message.success("已重命名");
      setRenameTarget(null);
      onReload();
    } catch (e) {
      message.error(
        (e as { userMessage?: string })?.userMessage ?? "重命名失败"
      );
    } finally {
      setRenaming(false);
    }
  };

  /** 删除项目（仅 owner；事项级联删除，二次确认） */
  const handleDeleteProject = (p: { id: Id; title: string }) => {
    Modal.confirm({
      title: `删除项目「${p.title}」？`,
      content: "项目下的所有事项将一并删除，不可恢复。",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteTodoProject(p.id, token);
          message.success("项目已删除");
          // 删除的是当前视图项目时切回全部事项，避免停留在已失效视图
          if (view.type === "project" && sameId(view.id, p.id)) {
            onViewChange({ type: "view", key: "all" });
          }
          onReload();
        } catch (e) {
          message.error(
            (e as { userMessage?: string })?.userMessage ?? "删除项目失败"
          );
        }
      },
    });
  };

  /** 渲染单个项目按钮（含拖拽与接收能力；owner 项目带右键菜单） */
  const renderProject = (
    p: {
      id: Id;
      title: string;
      icon?: string | null;
      visibility?: string;
      openCount?: number;
    },
    isOwned: boolean,
    indexInOwned: number
  ) => {
    const dropTargetCls =
      sameId(itemDropTarget, p.id) ? styles.sideItemDropOver : "";
    const activeCls =
      view.type === "project" && sameId(view.id, p.id)
        ? styles.sideItemActive
        : "";
    /** 仅 owner 可管理：重命名/成员管理/删除（后端同步校验 owner） */
    // antd6 迁移：Dropdown 的 `menu` 收 MenuProps 对象，不是 JSX 元素。
    // 原先 `overlay={<Menu>…</Menu>}` 而 antd6 从不读 `overlay` ⇒ 项目右键菜单弹出来是空的。
    const contextMenu: MenuProps | null = isOwned
      ? {
          items: [
            {
              key: "rename",
              icon: <EditOutlined />,
              label: "重命名",
              onClick: () => {
                setRenameTarget({ id: p.id, title: p.title });
                setRenameTitle(p.title);
              },
            },
            {
              key: "members",
              icon: <TeamOutlined />,
              label: "成员管理",
              onClick: () => onManageMembers?.(p.id),
            },
            { type: "divider" },
            {
              key: "delete",
              icon: <DeleteOutlined />,
              label: "删除项目",
              danger: true,
              onClick: () => handleDeleteProject(p),
            },
          ],
        }
      : null;
    const projectBtn = (
      <button
        type="button"
        className={`${styles.sideItem} ${activeCls} ${dropTargetCls}`}
        draggable={isOwned}
        onDragStart={(e) => {
          if (!isOwned) return;
          e.dataTransfer.setData(DRAG_PROJECT_MIME, String(p.id));
          e.dataTransfer.effectAllowed = "move";
          setDragProjectId(p.id);
        }}
        onDragEnd={resetProjectDrag}
        onDragOver={(e) => {
          // 项目拖拽：按上/下半区计算插入位
          if (acceptsProjectDrag(e) && isOwned) {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setProjectDropIndex(before ? indexInOwned : indexInOwned + 1);
            return;
          }
          // 事项拖入：由 itemDropHandlers 处理
          itemDropHandlers(p.id).onDragOver(e);
        }}
        onDragLeave={itemDropHandlers(p.id).onDragLeave}
        onDrop={(e) => {
          if (acceptsProjectDrag(e) && isOwned) {
            e.preventDefault();
            e.stopPropagation();
            handleProjectDrop();
            return;
          }
          itemDropHandlers(p.id).onDrop(e);
        }}
        onClick={() => onViewChange({ type: "project", id: p.id })}
        title={
          isOwned
            ? "点击进入 · 可拖拽排序 · 可接收拖入事项 · 右键管理（重命名/成员/删除）"
            : "点击进入 · 可接收拖入事项"
        }
      >
        <span className={styles.sideItemIcon}>{p.icon || "📁"}</span>
        <span className={styles.sideItemLabel}>
          {p.visibility === "shared" && (
            <TeamOutlined style={{ marginRight: 4 }} />
          )}
          {p.title}
        </span>
        {(p.openCount ?? 0) > 0 && (
          <span className={styles.sideItemCount}>{p.openCount}</span>
        )}
      </button>
    );
    return (
      <div key={p.id} className={styles.sideItemWrap}>
        {dragProjectId != null && projectDropIndex === indexInOwned && (
          <div className={styles.sideDropLine} />
        )}
        {contextMenu ? (
          <Dropdown menu={contextMenu} trigger={["contextMenu"]}>
            {projectBtn}
          </Dropdown>
        ) : (
          projectBtn
        )}
      </div>
    );
  };

  return (
    <div className={styles.sidebar}>
      {/* 视图 */}
      <div className={styles.sidebarSection}>
        {VIEW_ITEMS.map((v) => (
          <button
            key={v.key}
            type="button"
            className={`${styles.sideItem} ${
              isViewActive(v.key) ? styles.sideItemActive : ""
            }`}
            onClick={() => onViewChange({ type: "view", key: v.key })}
          >
            <span className={styles.sideItemIcon}>{v.icon}</span>
            <span className={styles.sideItemLabel}>{v.label}</span>
          </button>
        ))}
      </div>

      {/* 项目 */}
      <div className={styles.sidebarSection}>
        <div className={styles.sidebarTitle}>
          <span>项目</span>
          <button
            type="button"
            className={styles.sidebarTitleAction}
            onClick={() => setCreateOpen(true)}
          >
            <PlusOutlined /> 新建
          </button>
        </div>

        {owned.length > 0 && (
          <div className={styles.sideGroupLabel}>我拥有的</div>
        )}
        {owned.map((p, idx) => renderProject(p, true, idx))}
        {dragProjectId != null && projectDropIndex === owned.length && (
          <div className={styles.sideDropLine} />
        )}

        {joined.length > 0 && (
          <div className={styles.sideGroupLabel}>加入的</div>
        )}
        {joined.map((p) => renderProject(p, false, -1))}

        {owned.length === 0 && joined.length === 0 && (
          <div style={{ fontSize: 12, color: "#bfbfbf", padding: "4px 8px" }}>
            还没有项目，点击「新建」创建
          </div>
        )}
      </div>

      {/* 收集箱 */}
      <div className={styles.sidebarSection}>
        <button
          type="button"
          className={`${styles.sideItem} ${
            view.type === "inbox" ? styles.sideItemActive : ""
          } ${sameId(itemDropTarget, INBOX_PROJECT_ID) ? styles.sideItemDropOver : ""}`}
          {...itemDropHandlers(INBOX_PROJECT_ID)}
          onClick={() => onViewChange({ type: "inbox" })}
          title="点击进入 · 可接收拖入事项"
        >
          <span className={styles.sideItemIcon}>
            <InboxOutlined />
          </span>
          <span className={styles.sideItemLabel}>收集箱</span>
          {inboxCount > 0 && (
            <span className={styles.sideItemCount}>{inboxCount}</span>
          )}
        </button>
      </div>

      {/* 新建项目弹窗 */}
      <Modal
        title="新建项目"
        open={createOpen}
        width={400}
        className={styles.addModal}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText={<span>创建</span>}
        cancelText={BTN_CANCEL}
        confirmLoading={creating}
        destroyOnHidden
      >
        <div className={styles.addModalBody}>
          <Input
            placeholder="项目名称，如：XX版本发布跟进"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={handleCreate}
            maxLength={128}
            autoFocus
          />
          <div className={styles.addModalHint}>
            项目创建后默认私有，可在详情中添加成员转为共享（成员可编辑、可被指派）。
          </div>
        </div>
      </Modal>

      {/* 重命名项目弹窗（仅 owner） */}
      <Modal
        title="重命名项目"
        open={!!renameTarget}
        width={400}
        className={styles.addModal}
        onCancel={() => setRenameTarget(null)}
        onOk={handleRename}
        okText={<span>保存</span>}
        cancelText={BTN_CANCEL}
        confirmLoading={renaming}
        destroyOnHidden
      >
        <Input
          placeholder="项目名称"
          value={renameTitle}
          onChange={(e) => setRenameTitle(e.target.value)}
          onPressEnter={handleRename}
          maxLength={128}
          autoFocus
        />
      </Modal>
    </div>
  );
}
