import {
  CalendarOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FolderOutlined,
  HolderOutlined,
  InboxOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Checkbox, Dropdown, message, Popconfirm } from "antd";
import { Fragment, useMemo, useState } from "react";
import {type TodoItemView, type TodoStatusColumn} from "../../services/todo-api";
import {deleteTodoItem} from "../../services/todo-api";
import {toId, sameId, type Id} from "../../utils/id";
import type { GroupBy, TodoProjectContext } from "./index";
import {
  buildTodoGroups,
  DRAG_COLUMN_MIME,
  DRAG_ITEM_MIME,
  isDueToday,
  isOverdue,
  PRIORITY_LABEL,
  resolveAssignees,
  resolveProjectTitle,
  resolveStatusLabel,
} from "./index";
import styles from "./index.module.css";

export interface TodoListProps {
  /** 顶层事项（parentId=0）；子事项在详情抽屉维护 */
  items: TodoItemView[];
  groupBy: GroupBy;
  projectCtx: TodoProjectContext;
  /** 搜索模式：平铺展示匹配项（含子事项，不分组） */
  flat: boolean;
  /** 隐藏所有"添加事项"入口（如"已完成"视图） */
  hideAdd?: boolean;
  /** 状态看板列配置（项目空间扩展信息；决定列顺序与空列渲染） */
  statusColumns: TodoStatusColumn[];
  /** 是否可管理看板列（项目视图 owner 且按状态分组时） */
  canManageColumns?: boolean;
  onToggle: (item: TodoItemView) => void;
  onOpenDetail: (id: Id) => void;
  /** 删除成功后刷新（父组件 reload） */
  onDeleted: () => void;
  /** 拖拽落点上报：groupName=null 表示平铺；insertIndex 为列内插入位置（相对当前渲染序列） */
  onItemDropped: (
    itemId: Id,
    groupName: string | null,
    insertIndex: number
  ) => void;
  /** 列头 ＋ / 列表添加行：在该组新建（groupName=null 为列表模式） */
  onAddInGroup: (groupName: string | null) => void;
  /** 新增看板列（打开弹窗） */
  onAddColumn?: () => void;
  /** 重命名看板列（打开弹窗） */
  onRenameColumn?: (status: string, label: string) => void;
  /** 删除看板列（空列才可删，父组件兜底校验） */
  onDeleteColumn?: (status: string) => void;
  /** 列整体拖拽排序：上报看板可见列的新顺序（status key 数组，含兜底列） */
  onMoveColumn?: (orderedKeys: string[]) => void;
}

/** 插入指示：{ group, index }；group=null 为平铺模式 */
interface DropHint {
  group: string | null;
  index: number;
}

/** 优先级看板固定列（空列也渲染，保证拖拽目标常在）；状态列由项目配置驱动；指派人为动态列 */
const FIXED_COLS: Partial<Record<GroupBy, string[]>> = {
  priority: ["优先级：高", "优先级：中", "优先级：低"],
};

export default function TodoList({
  items,
  groupBy,
  projectCtx,
  flat,
  hideAdd,
  statusColumns,
  canManageColumns,
  onToggle,
  onOpenDetail,
  onDeleted,
  onItemDropped,
  onAddInGroup,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
  onMoveColumn,
}: TodoListProps) {
  const [dragItemId, setDragItemId] = useState<Id | null>(null);
  const [dropHint, setDropHint] = useState<DropHint | null>(null);
  /** 列整体拖拽：被拖列 key + 落点列与前后侧 */
  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const [colHint, setColHint] = useState<{
    key: string;
    before: boolean;
  } | null>(null);

  const topItems = useMemo(
    () => (flat ? items : items.filter((i) => !i.parentId)),
    [items, flat]
  );

  /** 分组：groupBy → [组名, 事项[]][]（保持稳定展示顺序；与拖拽落库共用） */
  const groups = useMemo(
    () =>
      flat
        ? ([[null, topItems]] as [string | null, TodoItemView[]][])
        : buildTodoGroups(topItems, groupBy, projectCtx, statusColumns),
    [topItems, groupBy, projectCtx, flat, statusColumns]
  );

  /**
   * 看板列：固定列补空 + 分组结果中的其余列追加。
   * 状态分组的固定列 = 项目列配置（含空列）；数据中出现但未配置的状态作为兜底列追加，
   * 防止事项状态悬空后看不见。
   */
  const columns = useMemo<[string, TodoItemView[]][]>(() => {
    if (flat || groupBy === "none") return groups as [string, TodoItemView[]][];
    const fixed =
      groupBy === "status"
        ? statusColumns.map((c) => String(c.status))
        : FIXED_COLS[groupBy] ?? [];
    const fixedCols = fixed.map(
      (n) =>
        [n, groups.find(([g]) => g === n)?.[1] ?? []] as [
          string,
          TodoItemView[]
        ]
    );
    return [
      ...fixedCols,
      ...groups.filter(
        (g): g is [string, TodoItemView[]] =>
          g[0] != null && !fixed.includes(g[0])
      ),
    ];
  }, [groups, groupBy, flat, statusColumns]);

  /** 搜索平铺模式：结果重排无意义，禁用拖拽 */
  const canDrag = !flat;

  /** 是否接受拖拽（仅本列表发起的事项拖动） */
  const acceptsDrag = (e: React.DragEvent) =>
    canDrag && e.dataTransfer.types.includes(DRAG_ITEM_MIME);

  /** 列整体拖拽排序：与列管理同口径（项目 owner + 按状态分组 + 非平铺） */
  const canReorderCols = !!canManageColumns && groupBy === "status";

  const finishDrag = () => {
    setDragItemId(null);
    setDropHint(null);
    setDragColKey(null);
    setColHint(null);
  };

  const showDropLine = (group: string | null, index: number) =>
    dragItemId != null &&
    dropHint != null &&
    dropHint.group === group &&
    dropHint.index === index;

  /** 卡片/行：上/下半区判定插入位置 */
  const rowDragProps = (
    item: TodoItemView,
    gName: string | null,
    idx: number
  ) => ({
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_ITEM_MIME, String(item.id));
      e.dataTransfer.effectAllowed = "move";
      setDragItemId(item.id);
    },
    onDragEnd: finishDrag,
    onDragOver: (e: React.DragEvent) => {
      if (!acceptsDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const before = e.clientY < rect.top + rect.height / 2;
      setDropHint({ group: gName, index: before ? idx : idx + 1 });
    },
    onDrop: (e: React.DragEvent) => {
      if (!acceptsDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
      const id = toId(e.dataTransfer.getData(DRAG_ITEM_MIME));
      if (id !== "") {
        const rect = e.currentTarget.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        onItemDropped(id, gName, before ? idx : idx + 1);
      }
      finishDrag();
    },
  });

  /** 列/组容器：落到空白（未被卡片拦截）→ 追加到末尾 */
  const zoneDragProps = (gName: string | null, count: number) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!acceptsDrag(e)) return;
      e.preventDefault();
      setDropHint({ group: gName, index: count });
    },
    onDrop: (e: React.DragEvent) => {
      if (!acceptsDrag(e)) return;
      e.preventDefault();
      // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
      const id = toId(e.dataTransfer.getData(DRAG_ITEM_MIME));
      if (id !== "") {
        onItemDropped(id, gName, dropHint?.index ?? count);
      }
      finishDrag();
    },
  });

  /** 列拖拽落点计算：把 dragKey 移到 targetKey 前/后（顺序无变化不上报） */
  const moveColumn = (dragKey: string, targetKey: string, before: boolean) => {
    const order = columns.map(([k]) => k);
    const from = order.indexOf(dragKey);
    if (from < 0) return;
    order.splice(from, 1);
    const to = order.indexOf(targetKey);
    if (to < 0) return;
    order.splice(before ? to : to + 1, 0, dragKey);
    onMoveColumn?.(order);
  };

  /**
   * 看板列容器：事项拖拽落到列空白 → 追加到列尾；
   * 列整体拖拽（列头发起）→ 按横向中线判定插到目标列前/后。
   * 卡片行未拦截的列拖拽事件会冒泡到这里（事项只认 DRAG_ITEM_MIME）。
   */
  const boardColDragProps = (gName: string, count: number) => ({
    onDragOver: (e: React.DragEvent) => {
      if (canReorderCols && e.dataTransfer.types.includes(DRAG_COLUMN_MIME)) {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setColHint({
          key: gName,
          before: e.clientX < rect.left + rect.width / 2,
        });
        return;
      }
      if (!acceptsDrag(e)) return;
      e.preventDefault();
      setDropHint({ group: gName, index: count });
    },
    onDrop: (e: React.DragEvent) => {
      if (canReorderCols && e.dataTransfer.types.includes(DRAG_COLUMN_MIME)) {
        e.preventDefault();
        e.stopPropagation();
        const dragKey = e.dataTransfer.getData(DRAG_COLUMN_MIME);
        if (dragKey) {
          const rect = e.currentTarget.getBoundingClientRect();
          moveColumn(dragKey, gName, e.clientX < rect.left + rect.width / 2);
        }
        finishDrag();
        return;
      }
      if (!acceptsDrag(e)) return;
      e.preventDefault();
      // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
      const id = toId(e.dataTransfer.getData(DRAG_ITEM_MIME));
      if (id !== "") {
        onItemDropped(id, gName, dropHint?.index ?? count);
      }
      finishDrag();
    },
  });

  /** 列表模式（搜索平铺 / 不分组）：垂直平铺 */
  if (flat || groupBy === "none") {
    const [gName, groupItems] = groups[0] as [string | null, TodoItemView[]];
    return (
      <div {...zoneDragProps(gName, groupItems.length)}>
        {!flat && !hideAdd && (
          <button
            type="button"
            className={styles.addRow}
            onClick={() => onAddInGroup(null)}
          >
            <PlusOutlined /> 添加事项
          </button>
        )}
        {!flat && groupItems.length === 0 && (
          <div className={styles.boardColEmpty}>暂无事项</div>
        )}
        {showDropLine(gName, 0) && <div className={styles.dropLine} />}
        {groupItems.map((item, idx) => (
          <Fragment key={item.id}>
            <TodoRow
              item={item}
              variant="row"
              projectCtx={projectCtx}
              dragging={sameId(dragItemId, item.id)}
              draggable={canDrag}
              onToggle={onToggle}
              onOpenDetail={onOpenDetail}
              onDeleted={onDeleted}
              {...rowDragProps(item, gName, idx)}
            />
            {showDropLine(gName, idx + 1) && (
              <div className={styles.dropLine} />
            )}
          </Fragment>
        ))}
      </div>
    );
  }

  /**
   * 项目两级列表（归档性视图默认）：一级项目分组头、二级条目行；
   * 组内拖拽排序，跨组拖拽 = 移动到目标项目/收集箱
   */
  if (groupBy === "project") {
    return (
      <div>
        {!hideAdd && (
          <button
            type="button"
            className={styles.addRow}
            onClick={() => onAddInGroup(null)}
          >
            <PlusOutlined /> 添加事项
          </button>
        )}
        {groups.map(([gName, groupItems]) => {
          // FE-PRECISION-FIX: ID 是 19 位字符串，分组名不能只按 \d+ 匹配
          const m = /^p:(.+)$/.exec(gName ?? "");
          const p = m ? projectCtx.byId.get(m[1]) ?? null : null;
          return (
            <div key={gName} className={styles.projectGroup}>
              <div className={styles.projectGroupHeader}>
                <span className={styles.projectGroupTitle}>
                  {p ? p.icon || "📁" : <InboxOutlined />}
                  {p ? p.title : "收集箱"}
                </span>
                <span className={styles.projectGroupCount}>
                  {groupItems.length}
                </span>
              </div>
              <div {...zoneDragProps(gName, groupItems.length)}>
                {showDropLine(gName, 0) && <div className={styles.dropLine} />}
                {groupItems.map((item, idx) => (
                  <Fragment key={item.id}>
                    <TodoRow
                      item={item}
                      variant="row"
                      hideProject
                      projectCtx={projectCtx}
                      dragging={sameId(dragItemId, item.id)}
                      draggable={canDrag}
                      onToggle={onToggle}
                      onOpenDetail={onOpenDetail}
                      onDeleted={onDeleted}
                      {...rowDragProps(item, gName, idx)}
                    />
                    {showDropLine(gName, idx + 1) && (
                      <div className={styles.dropLine} />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /** 看板模式：纵向列 + 卡片，跨列拖拽变更对应字段；列头可整体拖拽排序 */
  return (
    <div className={styles.boardWrap}>
      {columns.map(([gName, groupItems]) => {
        const dropOver = dragItemId != null && dropHint?.group === gName;
        /** 列插入指示：列整体拖拽悬停在本列左/右半区 */
        const colDropSide =
          dragColKey != null && colHint?.key === gName
            ? colHint.before
              ? "before"
              : "after"
            : null;
        /** 列显示名：状态分组组名为状态 key，需经配置解析；其他分组组名即显示名 */
        const colTitle =
          groupBy === "status" ? resolveStatusLabel(gName, projectCtx) : gName;
        return (
          <div
            key={gName}
            className={`${styles.boardCol} ${
              dropOver ? styles.boardColDropOver : ""
            } ${dragColKey === gName ? styles.boardColDragging : ""} ${
              colDropSide === "before"
                ? styles.boardColDropBefore
                : colDropSide === "after"
                ? styles.boardColDropAfter
                : ""
            }`}
            {...boardColDragProps(gName, groupItems.length)}
          >
            <div
              className={`${styles.boardColHeader} ${
                canReorderCols ? styles.boardColHeaderMovable : ""
              }`}
              title={canReorderCols ? "拖拽调整列顺序" : undefined}
              {...(canReorderCols
                ? {
                    draggable: true,
                    onDragStart: (e: React.DragEvent) => {
                      e.dataTransfer.setData(DRAG_COLUMN_MIME, gName);
                      e.dataTransfer.effectAllowed = "move";
                      setDragColKey(gName);
                    },
                    onDragEnd: finishDrag,
                  }
                : {})}
            >
              <span className={styles.boardColTitle}>{colTitle}</span>
              <span className={styles.boardColCount}>{groupItems.length}</span>
              <span className={styles.boardColSpacer} />
              {canManageColumns && groupBy === "status" && (
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    // antd6 迁移：Dropdown 的 `menu` 收 MenuProps 对象。
                    // 原先 `overlay={<Menu onClick=...><Menu.Item/></Menu>}`，
                    // 而 antd6 的 dropdown.js 只解构 `menu`、从不读 `overlay`
                    // ⇒ 列头下拉点开是空的。children 形式一并转成 items。
                    items: [
                      { key: "rename", label: "重命名列" },
                      { key: "delete", label: "删除列", danger: true },
                    ],
                    onClick: ({ key, domEvent }) => {
                      domEvent.stopPropagation();
                      if (key === "rename") {
                        onRenameColumn?.(gName, colTitle);
                      } else if (key === "delete") {
                        onDeleteColumn?.(gName);
                      }
                    },
                  }}
                >
                  <button
                    type="button"
                    className={styles.boardColAdd}
                    title="列设置"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreOutlined />
                  </button>
                </Dropdown>
              )}
              <button
                type="button"
                className={styles.boardColAdd}
                title="在此列新建事项"
                onClick={() => onAddInGroup(gName)}
              >
                <PlusOutlined />
              </button>
            </div>
            <div className={styles.boardColBody}>
              {groupItems.length === 0 && !dropOver && (
                <div className={styles.boardColEmpty}>拖拽事项到这里</div>
              )}
              {showDropLine(gName, 0) && <div className={styles.dropLine} />}
              {groupItems.map((item, idx) => (
                <Fragment key={item.id}>
                  <TodoRow
                    item={item}
                    variant="card"
                    projectCtx={projectCtx}
                    dragging={sameId(dragItemId, item.id)}
                    draggable
                    onToggle={onToggle}
                    onOpenDetail={onOpenDetail}
                    onDeleted={onDeleted}
                    {...rowDragProps(item, gName, idx)}
                  />
                  {showDropLine(gName, idx + 1) && (
                    <div className={styles.dropLine} />
                  )}
                </Fragment>
              ))}
            </div>
            {/* 列底 ＋ 新建（固定列底，不随卡片滚动；拖拽落点同列尾） */}
            {!hideAdd && (
              <button
                type="button"
                className={styles.boardColAddRow}
                onClick={() => onAddInGroup(gName)}
              >
                <PlusOutlined /> 添加事项
              </button>
            )}
          </div>
        );
      })}
      {/* 新增看板列入口（仅项目 owner 且按状态分组时可见） */}
      {canManageColumns && groupBy === "status" && onAddColumn && (
        <button
          type="button"
          className={styles.boardAddColumn}
          onClick={onAddColumn}
        >
          <PlusOutlined /> 新增列
        </button>
      )}
    </div>
  );
}

function TodoRow({
  item,
  variant,
  hideProject,
  projectCtx,
  dragging,
  draggable,
  onToggle,
  onOpenDetail,
  onDeleted,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  item: TodoItemView;
  /** row=列表行（带拖拽手柄）；card=看板卡片（白底、整卡可拖） */
  variant: "row" | "card";
  /** 项目分组列表中隐藏行内项目名（组头已展示） */
  hideProject?: boolean;
  projectCtx: TodoProjectContext;
  dragging: boolean;
  draggable: boolean;
  onToggle: (item: TodoItemView) => void;
  onOpenDetail: (id: Id) => void;
  onDeleted: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const isCard = variant === "card";
  const done = item.status === "DONE";
  const overdue = !done && isOverdue(item.dueDate);
  const dueToday = !done && isDueToday(item.dueDate);
  const projectName =
    item.projectId != null ? projectCtx.byId.get(item.projectId)?.title : null;
  const noteLink = item.links.find((l) => l.type === "note");
  const projectLinks = item.links.filter((l) => l.type === "project");
  const assignees = resolveAssignees(item, projectCtx);
  const assigneeTip = assignees.length
    ? `指派给：${assignees.map((a) => a.name).join("、")}`
    : "未指派";

  const dragProps = {
    draggable,
    onDragStart: draggable ? onDragStart : undefined,
    onDragEnd,
    onDragOver,
    onDrop,
  };

  /** 删除入口（行/卡片共用，样式类由调用方给定） */
  const renderDelete = (className: string) => (
    <Popconfirm
      title={
        <span>
          删除该事项？
          <br />
          子事项将一并删除
        </span>
      }
      okText="删除"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      onConfirm={async (e) => {
        e?.stopPropagation();
        try {
          await deleteTodoItem(item.id);
          message.success("已删除");
          onDeleted();
        } catch {
          message.error("删除失败");
        }
      }}
    >
      <span
        className={className}
        onClick={(e) => e.stopPropagation()}
        title="删除"
      >
        <DeleteOutlined />
      </span>
    </Popconfirm>
  );

  /**
   * 看板卡片：固定高度三区（标题区 2 行夹取 / 元信息行 / 指派行），
   * 左侧色条表达优先级，不占横向空间；元信息/指派行均定高单行裁切，保证列内高低齐平。
   */
  if (isCard) {
    return (
      <div
        className={`${styles.itemCard} ${done ? styles.itemCardDone : ""} ${
          dragging ? styles.itemRowDragging : ""
        }`}
        {...dragProps}
        onClick={() => onOpenDetail(item.id)}
        role="presentation"
      >
        <span
          className={`${styles.cardStripe} ${
            item.priority === "HIGH"
              ? styles.cardStripeHigh
              : item.priority === "LOW"
              ? styles.cardStripeLow
              : styles.cardStripeMedium
          }`}
          title={`优先级：${PRIORITY_LABEL[item.priority] ?? item.priority}`}
        />
        <div className={styles.cardMain}>
          <div className={styles.cardHead}>
            <span
              className={styles.cardCheck}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item);
              }}
            >
              <Checkbox checked={done} />
            </span>
            <span
              className={`${styles.cardTitle} ${
                done ? styles.cardTitleDone : ""
              }`}
              title={item.title}
            >
              {item.title}
            </span>
            {renderDelete(styles.cardDel)}
          </div>

          <div className={styles.cardMeta}>
            {item.dueDate && (
              <span
                className={`${styles.cardChip} ${styles.cardChipDue} ${
                  overdue
                    ? styles.cardChipOverdue
                    : dueToday
                    ? styles.cardChipToday
                    : ""
                }`}
                title={`截止 ${item.dueDate}`}
              >
                <CalendarOutlined />
                {item.dueDate.slice(5)}
                {overdue ? " 逾期" : ""}
              </span>
            )}
            {!hideProject && (
              <span
                className={`${styles.cardChip} ${styles.cardChipMuted}`}
                title="所属项目"
              >
                {item.projectId ? <FolderOutlined /> : <InboxOutlined />}
                {resolveProjectTitle(item, projectCtx)}
              </span>
            )}
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`${styles.cardChip} ${styles.cardChipTag}`}
                title={`#${tag}`}
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span
                className={styles.cardAvatarMore}
                title={item.tags.map((t) => `#${t}`).join(" ")}
              >
                +{item.tags.length - 2}
              </span>
            )}
          </div>

          <div className={styles.cardFoot}>
            {assignees.length > 0 ? (
              <>
                <span className={styles.cardAvatars} title={assigneeTip}>
                  {assignees.slice(0, 3).map((a) => (
                    <span
                      key={a.userId}
                      className={styles.cardAvatar}
                      title={a.name}
                    >
                      {a.name.slice(0, 1)}
                    </span>
                  ))}
                  {assignees.length > 3 && (
                    <span className={styles.cardAvatarMore}>
                      +{assignees.length - 3}
                    </span>
                  )}
                </span>
                {assignees.length === 1 && (
                  <span className={styles.cardAssigneeName}>
                    {assignees[0].name}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.cardUnassigned} title={assigneeTip}>
                <UserOutlined /> 未指派
              </span>
            )}
            <span className={styles.cardFootSpacer} />
            {item.parentId ? (
              <span className={styles.cardAvatarMore} title="子事项">
                子事项
              </span>
            ) : null}
            {noteLink && (
              <span
                className={`${styles.cardChip} ${styles.cardChipMuted}`}
                title={`关联笔记：${noteLink.title}`}
              >
                <FileTextOutlined />
              </span>
            )}
            {projectLinks.length > 0 && (
              <span
                className={`${styles.cardChip} ${styles.cardChipMuted}`}
                title={`关联群聊×${projectLinks.length}`}
              >
                <MessageOutlined />
                {projectLinks.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.itemRow} ${dragging ? styles.itemRowDragging : ""}`}
      {...dragProps}
      onClick={() => onOpenDetail(item.id)}
      role="presentation"
    >
      <span className={styles.dragHandle} title="拖拽排序 / 移动到项目">
        <HolderOutlined />
      </span>
      <span
        className={styles.itemCheck}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(item);
        }}
      >
        <Checkbox checked={done} />
      </span>

      <span
        className={`${styles.priorityDot} ${
          item.priority === "HIGH"
            ? styles.priorityHigh
            : item.priority === "LOW"
            ? styles.priorityLow
            : styles.priorityMedium
        }`}
        title={`优先级：${PRIORITY_LABEL[item.priority] ?? item.priority}`}
      />

      <div className={styles.itemBody}>
        <span
          className={`${styles.itemTitle} ${done ? styles.itemTitleDone : ""}`}
          title={item.title}
        >
          {item.title}
        </span>

        <div className={styles.itemMetaRow}>
          {/* 状态标签（含项目自定义状态，label 取看板列配置） */}
          <span
            className={`${styles.statusChip} ${
              item.status === "DONE"
                ? styles.statusDone
                : item.status === "DOING"
                ? styles.statusProgress
                : styles.statusTodo
            }`}
          >
            {resolveStatusLabel(item.status, projectCtx)}
          </span>

          {/* 截止日期 */}
          {item.dueDate && (
            <span
              className={`${styles.dueChip} ${
                overdue
                  ? styles.dueChipOverdue
                  : dueToday
                  ? styles.dueChipToday
                  : ""
              }`}
            >
              <CalendarOutlined />
              {item.dueDate.slice(5)}
              {overdue ? " 逾期" : ""}
            </span>
          )}

          {/* 指派人 */}
          {assignees.length > 0 && (
            <span className={styles.assigneeChip} title={assigneeTip}>
              <UserOutlined />
              {assignees[0].name}
              {assignees.length > 1 ? ` +${assignees.length - 1}` : ""}
            </span>
          )}

          {/* 所属项目 */}
          {projectName && !hideProject && (
            <span className={styles.projectChip} title="所属项目">
              <FolderOutlined />
              {projectName}
            </span>
          )}

          {/* 标签 */}
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tagChip}>
              #{tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className={styles.tagChip}>+{item.tags.length - 2}</span>
          )}

          {/* 子事项数 */}
          {item.parentId ? (
            <span className={styles.childCount} title="子事项">
              子事项
            </span>
          ) : null}

          {/* 链接 */}
          {noteLink && (
            <span className={styles.linkIcon} title={`笔记：${noteLink.title}`}>
              <FileTextOutlined />
            </span>
          )}
          {projectLinks.length > 0 && (
            <span
              className={styles.linkIcon}
              title={`群聊×${projectLinks.length}`}
            >
              <MessageOutlined />
              {projectLinks.length > 1 ? projectLinks.length : ""}
            </span>
          )}
        </div>
      </div>

      <div className={styles.rowActions}>
        {renderDelete(`${styles.rowActionBtn} ${styles.rowActionBtnDanger}`)}
      </div>
    </div>
  );
}
