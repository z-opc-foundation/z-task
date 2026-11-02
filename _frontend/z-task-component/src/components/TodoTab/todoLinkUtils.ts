import {sameId, type Id} from "../../utils/id";
import type {
  TodoItemView,
  TodoLink,
  TodoProjectBundle,
} from "../../services/todo-api";
import {
  parseStatusColumns,
  type TodoProjectSummary,
} from "../../services/todo-api";
import type { TodoProjectContext } from "./index";
import { STATUS_LABEL } from "./index";

export interface TodoSelectOption {
  value: Id;
  label: string;
}

/** 构建项目上下文（owned + joined；与 index.tsx 主实现同口径：状态 key→显示名并集） */
export function buildTodoProjectContext(
  bundle: TodoProjectBundle | null
): TodoProjectContext {
  const byId = new Map<Id, TodoProjectSummary>();
  const userNameById = new Map<string, string>();
  const statusLabelByKey = new Map<string, string>();
  if (bundle) {
    for (const p of [...bundle.owned, ...bundle.joined]) {
      byId.set(p.id, p);
      if (p.createByName && p.userId) {
        userNameById.set(p.userId, p.createByName);
      }
      for (const m of p.memberDetails ?? []) {
        userNameById.set(m.userId, m.userName);
      }
      for (const col of parseStatusColumns(p.extraInfo)) {
        if (!statusLabelByKey.has(col.status)) {
          statusLabelByKey.set(col.status, col.label);
        }
      }
    }
  }
  return { byId, userNameById, statusLabelByKey };
}

/** 事项所属项目展示名 */
export function todoProjectLabel(
  item: TodoItemView,
  projectCtx: TodoProjectContext
): string {
  if (item.projectId == null) return "收集箱";
  return projectCtx.byId.get(item.projectId)?.title ?? `项目#${item.projectId}`;
}

/** 展平为 Select 选项：[项目/收集箱] 事项标题 · 状态 */
export function flattenTodoOptions(
  items: TodoItemView[],
  projectCtx: TodoProjectContext,
  excludeTodoIds: Id[] = []
): TodoSelectOption[] {
  const exclude = new Set(excludeTodoIds);
  return items
    .filter((i) => !i.parentId && !exclude.has(i.id))
    .map((i) => {
      const proj = todoProjectLabel(i, projectCtx);
      const status = STATUS_LABEL[i.status] ?? i.status;
      return {
        value: i.id,
        label: `[${proj}] ${i.title} · ${status}`,
      };
    });
}

/** 查找 links 中关联了指定笔记的事项 */
export function findTodosLinkedToNote(
  items: TodoItemView[],
  noteId: Id
): TodoItemView[] {
  return items.filter((i) =>
    i.links.some((l) => l.type === "note" && sameId(l.id, noteId))
  );
}

/** 判断事项是否已关联指定笔记 */
export function todoHasNoteLink(item: TodoItemView, noteId: Id): boolean {
  return item.links.some((l) => l.type === "note" && sameId(l.id, noteId));
}

/** 追加笔记关联（去重） */
export function addNoteLink(
  links: TodoLink[],
  noteId: Id,
  title: string
): TodoLink[] {
  if (links.some((l) => l.type === "note" && sameId(l.id, noteId))) {
    return links;
  }
  return [...links, { type: "note", id: noteId, title }];
}

/** 移除笔记关联 */
export function removeNoteLink(links: TodoLink[], noteId: Id): TodoLink[] {
  return links.filter((l) => !(l.type === "note" && sameId(l.id, noteId)));
}

/** 移除群聊关联 */
export function removeProjectLink(
  links: TodoLink[],
  projectId: Id
): TodoLink[] {
  return links.filter(
    (l) => !(l.type === "project" && sameId(l.id, projectId))
  );
}

/** 已关联事项的 chip 展示文案 */
export function linkedTodoChipLabel(
  item: TodoItemView,
  projectCtx: TodoProjectContext
): string {
  const proj = todoProjectLabel(item, projectCtx);
  const status = STATUS_LABEL[item.status] ?? item.status;
  return `[${proj}] ${item.title} · ${status}`;
}
