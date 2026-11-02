import {
  CloseOutlined,
  DeleteOutlined,
  LinkOutlined,
  MessageOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Input,
  message,
  Select,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {fetchScenarioInstances, parseStatusColumns, uploadChatImage, type NoteNode, type TodoItemView, type TodoLink, type TodoProjectBundle} from "../../services/todo-api";
import {fetchNoteTree} from "../../services/todo-api";
import {completeTodoItem, createTodoItem, deleteTodoItem, reopenTodoItem, updateTodoItem} from "../../services/todo-api";
import {isPositiveId, sameId, type Id} from "../../utils/id";
import { INBOX_PROJECT_ID } from "./index";
import { MarkdownLiveEditor } from "@yuku123/z-markdown-component";
import type { TodoProjectContext } from "./index";
import { resolveAssignees, resolveStatusLabel, STATUS_LABEL } from "./index";
import styles from "./index.module.css";
import { TodoDetailChatsColumn } from "./TodoDetailChatsColumn";
import { TodoDetailNotesColumn } from "./TodoDetailNotesColumn";
import TodoAgentSection from "./TodoAgentSection";
import { addNoteLink, removeNoteLink } from "./todoLinkUtils";

const DETAIL_MAIN_WIDTH = 520;
const LINKS_SIDE_WIDTH = 340;

export interface TodoDetailDrawerProps {
  item: TodoItemView;
  /** 父组件当前视图全量事项（含子事项，用于渲染子事项列表） */
  allItems: TodoItemView[];
  projectCtx: TodoProjectContext;
  bundle: TodoProjectBundle | null;
  token: string;
  /** 当前用户 FT userId（由父组件从 owned 项目/收集箱事项推导） */
  myUserId: string;
  onClose: () => void;
  /** 任一变更后刷新（父组件 reload） */
  onChanged: () => void;
  onOpenNote: (noteId: Id) => void;
  onOpenProject: (projectId: string) => void;
  /** 打开该待办绑定的 Agent 会话（父组件能路由才传；缺省时按钮不显示） */
  onOpenSession?: (sessionId: Id, agentId: Id) => void;
}

export default function TodoDetailDrawer({
  item,
  allItems,
  projectCtx,
  bundle,
  token,
  myUserId,
  onClose,
  onChanged,
  onOpenSession,
}: TodoDetailDrawerProps) {
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [detailDraft, setDetailDraft] = useState(item.detail ?? "");
  const [savingDetail, setSavingDetail] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");

  // FE-PRECISION-FIX: 关联项的 value 是 ID（雪花 ID 字符串），不能用 number
  const [noteOptions, setNoteOptions] = useState<
    { value: Id; label: string }[]
  >([]);
  const [chatOptions, setChatOptions] = useState<
    { value: Id; label: string }[]
  >([]);
  const [localAssigneeIds, setLocalAssigneeIds] = useState<string[]>([]);
  const [linksPanelExpanded, setLinksPanelExpanded] = useState(false);
  const [notesEditorOpen, setNotesEditorOpen] = useState(false);

  // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
  const project =
    item.projectId != null
      ? projectCtx.byId.get(item.projectId)
      : undefined;

  useEffect(() => {
    setLinksPanelExpanded(false);
    setNotesEditorOpen(false);
  }, [item.id]);

  useEffect(() => {
    setTitleDraft(item.title);
    setDetailDraft(item.detail ?? "");
    // 后端只有单个 assigneeUserId（TodoItem.java:95），assigneeUserIds 从不返回。
    // 原写法 `item.assigneeUserIds ?? []` 不会崩，但恒等于 []，于是编辑抽屉里的
    // 指派人永远是空的 —— 打开就等于把已有指派人显示成「无」。
    setLocalAssigneeIds(item.assigneeUserId ? [item.assigneeUserId] : []);
  }, [item.id, item.title, item.detail, item.assigneeUserId]);

  useEffect(() => {
    fetchNoteTree(token, false)
      .then((tree) => setNoteOptions(flattenNotes(tree)))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchScenarioInstances(token)
      .then((list: unknown) => {
        const arr = Array.isArray(list) ? list : [];
        setChatOptions(
          arr.map((p) => ({
            value: String((p as Record<string, unknown>).id ?? ""),
            label: String((p as Record<string, unknown>).name ?? ""),
          }))
        );
      })
      .catch(() => {});
  }, [token]);

  const patch = useCallback(
    async (body: Parameters<typeof updateTodoItem>[1]) => {
      try {
        await updateTodoItem(item.id, body, token);
        onChanged();
      } catch (e) {
        message.error(
          (e as { userMessage?: string })?.userMessage ?? "保存失败"
        );
      }
    },
    [item.id, token, onChanged]
  );

  const patchLinks = useCallback(
    (links: TodoLink[]) => patch({ links }),
    [patch]
  );

  const saveDetail = useCallback(async () => {
    setSavingDetail(true);
    await patch({ detail: detailDraft });
    setSavingDetail(false);
  }, [patch, detailDraft]);

  const handleStatusChange = async (next: string) => {
    try {
      if (next === "DONE" && item.status !== "DONE") {
        await completeTodoItem(item.id, "", token);
      } else {
        await updateTodoItem(
          item.id,
          { status: next as TodoItemView["status"] },
          token
        );
      }
      onChanged();
    } catch (e) {
      message.error(
        (e as { userMessage?: string })?.userMessage ?? "状态更新失败"
      );
    }
  };

  const childTodos = useMemo(
    () => allItems.filter((i) => sameId(i.parentId, item.id)),
    [allItems, item.id]
  );

  const handleAddChild = async () => {
    const title = newChildTitle.trim();
    if (!title) return;
    try {
      await createTodoItem(
        {
          title,
          parentId: item.id,
          projectId: item.projectId ?? undefined,
        },
        token
      );
      setNewChildTitle("");
      onChanged();
    } catch {
      message.error("添加子事项失败");
    }
  };

  const noteLinks = item.links.filter((l) => l.type === "note");
  const projectLinks = item.links.filter((l) => l.type === "project");
  const urlLinks = item.links.filter((l) => l.type === "url");

  const allProjects = [...(bundle?.owned ?? []), ...(bundle?.joined ?? [])];

  // FE-PRECISION-FIX: 收集箱哨兵为 "0"，不能用 Number()（会抹掉末位）也不能用数字 0（与字符串 ID 不兼容）
  const currentProjectId: Id = item.projectId ?? INBOX_PROJECT_ID;
  const projectOptions: { value: Id; label: string }[] = [
    { value: INBOX_PROJECT_ID, label: "收集箱" },
    ...allProjects.map((p) => ({ value: p.id, label: p.title })),
  ];
  if (
    isPositiveId(currentProjectId) &&
    !projectOptions.some((o) => sameId(o.value, currentProjectId))
  ) {
    projectOptions.push({
      value: currentProjectId,
      // normalizeTodoItem 不产出 projectTitle，后端 TodoItem 实体也无该列，
      // 原 `?? item.projectTitle` 恒为 undefined。删掉后由 id 兜底。
      label: `项目 ${currentProjectId}`,
    });
  }

  const statusOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = Object.entries(
      STATUS_LABEL
    ).map(([value, label]) => ({ value, label }));
    const seen = new Set(opts.map((o) => o.value));
    for (const col of parseStatusColumns(project?.extraInfo)) {
      const key = String(col.status);
      if (!seen.has(key)) {
        opts.push({ value: key, label: col.label });
        seen.add(key);
      }
    }
    if (!seen.has(item.status)) {
      opts.push({
        value: item.status,
        label: resolveStatusLabel(item.status, projectCtx),
      });
    }
    return opts;
  }, [project, item.status, projectCtx]);

  const currentAssignees = resolveAssignees(item, projectCtx);

  const assigneeOptions: { value: string; label: string }[] = (() => {
    if (!project) return [];
    const opts: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    if (project.userId) {
      opts.push({
        value: project.userId,
        label: project.createByName || "项目 owner",
      });
      seen.add(project.userId);
    }
    for (const m of project.memberDetails ?? []) {
      if (!seen.has(m.userId)) {
        opts.push({ value: m.userId, label: m.userName });
        seen.add(m.userId);
      }
    }
    return opts;
  })();
  const assigneeOptionIds = new Set(assigneeOptions.map((o) => o.value));
  for (const a of currentAssignees) {
    if (!assigneeOptionIds.has(a.userId)) {
      assigneeOptions.push({ value: a.userId, label: a.name });
      assigneeOptionIds.add(a.userId);
    }
  }

  const drawerWidth = useMemo(() => {
    if (!linksPanelExpanded) return DETAIL_MAIN_WIDTH;
    if (notesEditorOpen) return "92%";
    return DETAIL_MAIN_WIDTH + LINKS_SIDE_WIDTH * 2;
  }, [linksPanelExpanded, notesEditorOpen]);

  return (
    <Drawer
      open
      width={drawerWidth}
      className={styles.detailDrawer}
      title={`事项详情${project ? ` · ${project.title}` : " · 收集箱"}`}
      onClose={onClose}
      destroyOnHidden
    >
      <div className={styles.detailThreeCol}>
        {/* 列 1：事项详情 */}
        <div className={`${styles.detailCol} ${styles.detailColMain}`}>
          <div className={styles.detailColHeader}>
            <span>事项详情</span>
            <div className={styles.detailColHeaderActions}>
              <Tooltip
                title={
                  linksPanelExpanded ? "收起群聊/笔记面板" : "展开群聊与笔记"
                }
              >
                <Button
                  size="small"
                  type={linksPanelExpanded ? "primary" : "default"}
                  className={
                    linksPanelExpanded ? undefined : styles.detailPanelToggleBtn
                  }
                  icon={<MessageOutlined />}
                  onClick={() => {
                    setLinksPanelExpanded((v) => {
                      if (v) setNotesEditorOpen(false);
                      return !v;
                    });
                  }}
                >
                  群聊/笔记
                  {noteLinks.length + projectLinks.length > 0
                    ? ` ${noteLinks.length + projectLinks.length}`
                    : ""}
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className={styles.detailColBody}>
            <Input
              className={styles.detailTitleInput}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                if (titleDraft.trim() && titleDraft.trim() !== item.title) {
                  patch({ title: titleDraft.trim() });
                }
              }}
              onPressEnter={() => {
                if (titleDraft.trim() && titleDraft.trim() !== item.title) {
                  patch({ title: titleDraft.trim() });
                }
              }}
            />

            <div className={styles.detailAttrGrid}>
              <div className={styles.detailAttrField}>
                <span className={styles.detailAttrLabel}>状态</span>
                <Select
                  size="small"
                  className={styles.detailFullWidth}
                  dropdownClassName={styles.detailDropdown}
                  value={item.status}
                  onChange={handleStatusChange}
                  options={statusOptions}
                />
              </div>
              <div className={styles.detailAttrField}>
                <span className={styles.detailAttrLabel}>优先级</span>
                <Select
                  size="small"
                  className={styles.detailFullWidth}
                  dropdownClassName={styles.detailDropdown}
                  value={item.priority}
                  onChange={(v) => patch({ priority: v })}
                  options={[
                    { value: "HIGH", label: "高优先级" },
                    { value: "MEDIUM", label: "中优先级" },
                    { value: "LOW", label: "低优先级" },
                  ]}
                />
              </div>
              <div className={styles.detailAttrField}>
                <span className={styles.detailAttrLabel}>截止日期</span>
                <DatePicker
                  size="small"
                  allowClear
                  className={styles.detailFullWidth}
                  placeholder="未设置"
                  value={item.dueDate ? dayjs(item.dueDate) : null}
                  onChange={(d) =>
                    patch({
                      dueDate: d ? d.format("YYYY-MM-DD") : "",
                    })
                  }
                />
              </div>
              <div className={styles.detailAttrField}>
                <span className={styles.detailAttrLabel}>所属项目</span>
                <Select
                  size="small"
                  className={styles.detailFullWidth}
                  dropdownClassName={styles.detailDropdown}
                  placeholder="所属项目"
                  value={currentProjectId}
                  onChange={(v) => patch({ projectId: v })}
                  options={projectOptions}
                />
              </div>
              {(isPositiveId(currentProjectId) || localAssigneeIds.length > 0) && (
                <div
                  className={`${styles.detailAttrField} ${styles.detailAttrFull}`}
                >
                  <span className={styles.detailAttrLabel}>
                    指派成员（可多选）
                  </span>
                  <Select
                    mode="multiple"
                    size="small"
                    className={styles.detailFullWidth}
                    popupClassName={styles.detailDropdown}
                    virtual={false}
                    disabled={!isPositiveId(currentProjectId)}
                    placeholder={
                      !isPositiveId(currentProjectId)
                        ? "收集箱事项不支持指派"
                        : "未指派"
                    }
                    allowClear
                    optionFilterProp="label"
                    value={localAssigneeIds}
                    onChange={(v) => {
                      const ids = (v as string[]) ?? [];
                      setLocalAssigneeIds(ids);
                      // z-team 后端当前仅支持单指派人：首位兜底到 assigneeUserId
                      patch({ assigneeUserIds: ids, assigneeUserId: ids[0] ?? "" });
                    }}
                    options={assigneeOptions}
                  />
                </div>
              )}
              {item.completedAt && (
                <Tag color="green" className={styles.detailAttrFull}>
                  {item.completedBy === myUserId
                    ? "我"
                    : item.completedBy || "已"}
                  完成 · {item.completedAt.slice(0, 16).replace("T", " ")}
                </Tag>
              )}
            </div>

            {/* 交给 Agent：一条待办 = 一个该项目空间下的 Agent 会话 */}
            <TodoAgentSection item={item} token={token} onChanged={onChanged} onOpenSession={onOpenSession} />

            <div className={styles.detailTagRow}>
              {item.tags.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() =>
                    patch({ tags: item.tags.filter((t) => t !== tag) })
                  }
                >
                  #{tag}
                </Tag>
              ))}
              <Input
                size="small"
                className={styles.detailTagInput}
                placeholder="标签 回车"
                prefix={<PlusOutlined className={styles.detailInputPrefix} />}
                onPressEnter={(e) => {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v && !item.tags.includes(v)) {
                    patch({ tags: [...item.tags, v] });
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>子事项</div>
              {childTodos.length === 0 && (
                <div className={styles.detailHint}>暂无子事项</div>
              )}
              {childTodos.map((c) => (
                <div key={c.id} className={styles.detailChildRow}>
                  <Checkbox
                    checked={c.status === "DONE"}
                    onChange={async () => {
                      try {
                        if (c.status === "DONE") {
                          await reopenTodoItem(c.id, token);
                        } else {
                          await completeTodoItem(c.id, "", token);
                        }
                        onChanged();
                      } catch {
                        message.error("操作失败");
                      }
                    }}
                  />
                  <span
                    className={`${styles.detailChildTitle} ${
                      c.status === "DONE" ? styles.detailChildTitleDone : ""
                    }`}
                  >
                    {c.title}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={async () => {
                      try {
                        await deleteTodoItem(c.id, token);
                        onChanged();
                      } catch {
                        message.error("删除失败");
                      }
                    }}
                  />
                </div>
              ))}
              <Input
                size="small"
                className={styles.detailFullWidth}
                placeholder="子事项 回车"
                prefix={<PlusOutlined className={styles.detailInputPrefix} />}
                value={newChildTitle}
                onChange={(e) => setNewChildTitle(e.target.value)}
                onPressEnter={handleAddChild}
              />
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>链接</div>
              {urlLinks.length > 0 && (
                <div className={styles.detailLinkList}>
                  {urlLinks.map((l) => (
                    <div
                      key={`url-${l.title}-${l.url}`}
                      className={styles.detailLinkListItem}
                      onClick={() => l.url && window.open(l.url, "_blank")}
                    >
                      <LinkOutlined className={styles.detailLinkListItemIcon} />
                      <span
                        className={styles.detailLinkListItemTitle}
                        title={l.title}
                      >
                        {l.title}
                      </span>
                      <span className={styles.detailLinkListItemActions}>
                        <CloseOutlined
                          className={styles.detailLinkListItemRemove}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            patchLinks(
                              item.links.filter(
                                (x) =>
                                  !(
                                    x.type === "url" &&
                                    x.url === l.url &&
                                    x.title === l.title
                                  )
                              )
                            );
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Input
                size="small"
                className={styles.detailFullWidth}
                placeholder="粘贴链接回车，自动取标题"
                onPressEnter={(e) => {
                  const el = e.target as HTMLInputElement;
                  const url = el.value.trim();
                  if (!url) return;
                  let title = url;
                  try {
                    title = decodeURIComponent(
                      url.split("/").pop() || url
                    ).slice(0, 60);
                  } catch {
                    /* ignore */
                  }
                  patchLinks([...item.links, { type: "url", title, url }]);
                  el.value = "";
                }}
              />
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>补充描述</div>
              <div className={styles.detailEditorWrap}>
                <MarkdownLiveEditor
                  key={item.id}
                  mode="live"
                  value={detailDraft}
                  onChange={setDetailDraft}
                  onUploadImage={uploadChatImage}
                  onSave={saveDetail}
                  placeholder="补充描述，支持 Markdown，可直接粘贴图片"
                />
              </div>
              {detailDraft !== (item.detail ?? "") && (
                <Button
                  size="small"
                  type="primary"
                  className={styles.detailSaveBtn}
                  loading={savingDetail}
                  onClick={saveDetail}
                >
                  保存描述
                </Button>
              )}
            </div>
          </div>
        </div>

        {linksPanelExpanded && (
          <div
            className={`${styles.detailColLinksPanel} ${
              notesEditorOpen ? styles.detailColLinksPanelWithEditor : ""
            }`}
          >
            <div className={`${styles.detailCol} ${styles.detailColLinksSide}`}>
              <div className={styles.detailColBodyFlush}>
                <TodoDetailChatsColumn
                  item={item}
                  projectLinks={projectLinks}
                  chatOptions={chatOptions}
                  token={token}
                  onPatchLinks={patchLinks}
                />
              </div>
            </div>
            <div
              className={`${styles.detailCol} ${styles.detailColNotes} ${
                notesEditorOpen
                  ? styles.detailColNotesExpanded
                  : styles.detailColLinksSide
              }`}
            >
              <div className={styles.detailColBodyFlush}>
                <TodoDetailNotesColumn
                  noteLinks={noteLinks}
                  noteOptions={noteOptions}
                  token={token}
                  onEditorOpenChange={setNotesEditorOpen}
                  onAddNote={(noteId, title) => {
                    patchLinks(addNoteLink(item.links, noteId, title));
                  }}
                  onRemoveNote={(noteId) => {
                    patchLinks(removeNoteLink(item.links, noteId));
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function flattenNotes(
  nodes: NoteNode[],
  prefix = ""
): { value: Id; label: string }[] {
  const result: { value: Id; label: string }[] = [];
  for (const n of nodes) {
    const path = prefix ? `${prefix}/${n.title}` : n.title;
    if (n.type === "note") {
      result.push({ value: n.id, label: path });
    }
    if (n.children?.length) {
      result.push(
        ...flattenNotes(n.children, n.type === "folder" ? path : prefix)
      );
    }
  }
  return result;
}
