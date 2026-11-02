import {
  BarsOutlined,
  CloseOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import {toId, sameId, type Id} from "../../utils/id";
import { Button, message, Segmented, Select, Spin, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {uploadChatImage, type TodoLink} from "../../services/todo-api";
import {favoriteNote, fetchFavorites, fetchNote, shareNote, unfavoriteNote, updateNote} from "../../services/todo-api";
import {
  MarkdownLiveEditor,
  type LiveEditorMode,
  type MarkdownLiveEditorHandle,
} from "@yuku123/z-markdown-component";
import styles from "./index.module.css";

interface TocItem {
  level: number;
  text: string;
  index: number;
  offset: number;
}

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export interface TodoDetailNotesColumnProps {
  noteLinks: TodoLink[];
  noteOptions: { value: Id; label: string }[];
  token: string;
  onAddNote: (noteId: Id, title: string) => void;
  onRemoveNote: (noteId: Id) => void;
  onEditorOpenChange?: (open: boolean) => void;
}

function extractToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");
  let offset = 0;
  let idx = 0;
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      const level = m[1].length;
      const text = m[2].replace(/[#*_`~]/g, "").trim();
      items.push({ level, text, index: idx++, offset });
    }
    offset += line.length + 1;
  }
  return items;
}

export function TodoDetailNotesColumn({
  noteLinks,
  noteOptions,
  token,
  onAddNote,
  onRemoveNote,
  onEditorOpenChange,
}: TodoDetailNotesColumnProps) {
  const [activeNoteId, setActiveNoteId] = useState<Id | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [mode, setMode] = useState<LiveEditorMode>("live");
  const [tocVisible, setTocVisible] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef<MarkdownLiveEditorHandle>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeNoteIdRef = useRef<Id | null>(null);
  const titleRef = useRef("");
  const contentRef = useRef("");

  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    if (
      activeNoteId != null &&
      !noteLinks.some((l) => sameId(l.id, activeNoteId))
    ) {
      setActiveNoteId(null);
      setEditorReady(false);
    }
  }, [noteLinks, activeNoteId]);

  const doSave = useCallback(
    async (force = false) => {
      const id = activeNoteIdRef.current;
      if (!id || readOnly || (!dirty && !force)) return;
      setSaveStatus("saving");
      try {
        await updateNote(
          id,
          { title: titleRef.current, content: contentRef.current },
          token
        );
        setDirty(false);
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus((s) => (s === "saved" ? "idle" : s));
        }, 3000);
      } catch {
        setSaveStatus("error");
        message.error("保存失败");
      }
    },
    [readOnly, dirty, token]
  );

  const scheduleSave = useCallback(() => {
    if (readOnly) return;
    setDirty(true);
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void doSave();
    }, 2000);
  }, [readOnly, doSave]);

  const saveNow = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await doSave(true);
  }, [doSave]);

  const loadNote = useCallback(
    async (noteId: Id) => {
      setLoading(true);
      setEditorReady(false);
      setDirty(false);
      setSaveStatus("idle");
      setMode("live");
      setTocVisible(false);
      setFavorited(false);
      setActiveNoteId(noteId);
      activeNoteIdRef.current = noteId;
      try {
        const detail = await fetchNote(noteId, token);
        if (!sameId(activeNoteIdRef.current, noteId)) return;
        titleRef.current = detail.title;
        contentRef.current = detail.content ?? "";
        setTitle(detail.title);
        setContent(detail.content ?? "");
        // 原判据 detail.canEdit === false 恒为 false：canEdit 恒 undefined，
        // 而 undefined === false 是 false，于是 readOnly 恒 false（永远可编辑）。
        // 后端 TeamNoteController#get 与 /shared 返回的都是 TeamNote，无该列
        // （canEdit 只存在于另一个实体 PersonalNote）。
        // 真正的只读控制在别处：共享笔记走 note/shared.tsx 独立页面，
        // updateNote 需 token 且后端按 userId 校验。
        setReadOnly(false);
        setEditorReady(true);
        const favs = await fetchFavorites(token).catch(() => []);
        if (activeNoteIdRef.current !== noteId) return;
        setFavorited(
          Array.isArray(favs) && favs.some((f) => f.refId === noteId)
        );
      } catch {
        if (sameId(activeNoteIdRef.current, noteId)) {
          message.error("加载笔记失败");
          setEditorReady(false);
        }
      } finally {
        if (sameId(activeNoteIdRef.current, noteId)) setLoading(false);
      }
    },
    [token]
  );

  const collapseEditor = useCallback(async () => {
    if (dirty && !readOnly) {
      await saveNow();
    }
    setActiveNoteId(null);
    activeNoteIdRef.current = null;
    setEditorReady(false);
    setLoading(false);
    setDirty(false);
    setSaveStatus("idle");
  }, [dirty, readOnly, saveNow]);

  const handleSelectNote = useCallback(
    async (noteId: Id) => {
      if (sameId(activeNoteId, noteId) && (editorReady || loading)) {
        await collapseEditor();
        return;
      }
      if (activeNoteId && !sameId(activeNoteId, noteId) && dirty && !readOnly) {
        await saveNow();
      }
      await loadNote(noteId);
    },
    [
      activeNoteId,
      editorReady,
      loading,
      dirty,
      readOnly,
      saveNow,
      loadNote,
      collapseEditor,
    ]
  );

  const handleShare = useCallback(async () => {
    const id = activeNoteIdRef.current;
    if (!id) return;
    setShareLoading(true);
    try {
      const shareToken = await shareNote(id, token);
      const shareUrl = `${window.location.origin}/note/shared?token=${shareToken}`;
      let copied = false;
      try {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      } catch {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          copied = true;
        } catch {
          /* ignore */
        }
        document.body.removeChild(ta);
      }
      message.success(
        copied ? "分享链接已复制到剪贴板" : "复制失败，请手动复制链接"
      );
    } catch {
      message.error("生成分享链接失败");
    } finally {
      setShareLoading(false);
    }
  }, [token]);

  const handleToggleFavorite = useCallback(async () => {
    const id = activeNoteIdRef.current;
    if (id == null) return;
    setFavLoading(true);
    try {
      if (favorited) {
        await unfavoriteNote(id, token);
        setFavorited(false);
        message.success("已取消收藏");
      } else {
        await favoriteNote(id, token);
        setFavorited(true);
        message.success("已收藏到个人面板");
      }
    } catch {
      message.error(favorited ? "取消收藏失败" : "收藏失败");
    } finally {
      setFavLoading(false);
    }
  }, [favorited, token]);

  const toc = useMemo(() => extractToc(content), [content]);

  const handleTocClick = useCallback(
    (item: TocItem) => {
      if (mode === "source") {
        const ta = editorRef.current?.getTextarea();
        if (ta) {
          ta.focus();
          ta.setSelectionRange(item.offset, item.offset);
        }
      } else {
        const root = editorRef.current?.getLiveRoot();
        const headings =
          root?.querySelectorAll<HTMLHeadingElement>("h1,h2,h3,h4,h5,h6");
        headings?.[item.index]?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [mode]
  );

  const showEditor = Boolean(activeNoteId && (loading || editorReady));

  useEffect(() => {
    onEditorOpenChange?.(showEditor);
  }, [showEditor, onEditorOpenChange]);

  return (
    <div
      className={`${styles.detailNoteLayout} ${
        !showEditor ? styles.detailNoteLayoutListOnly : ""
      }`}
    >
      <aside className={styles.detailNoteSidebar}>
        <div className={styles.detailNoteSidebarToolbar}>
          <Select
            size="small"
            className={styles.detailNoteSidebarSelect}
            dropdownClassName={styles.detailDropdown}
            showSearch
            placeholder="关联个人笔记"
            optionFilterProp="label"
            options={noteOptions}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={null}
            onChange={(v) => {
              if (v == null) return;
              const opt = noteOptions.find((n) => sameId(n.value, v));
              if (!opt) return;
              const noteTitle = opt.label.split("/").pop() ?? opt.label;
              onAddNote(v, noteTitle);
              void handleSelectNote(v);
            }}
          />
        </div>
        {noteLinks.length > 0 ? (
          <div className={styles.detailNoteSidebarList}>
            {noteLinks.map((l) => {
              // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
              const noteId = toId(l.id);
              const active = sameId(activeNoteId, noteId);
              return (
                <div
                  key={`note-${l.id}`}
                  className={`${styles.detailNoteSidebarItem} ${
                    active ? styles.detailNoteSidebarItemActive : ""
                  }`}
                  onClick={() => void handleSelectNote(noteId)}
                >
                  <FileTextOutlined
                    className={styles.detailNoteSidebarItemIcon}
                  />
                  <span
                    className={styles.detailNoteSidebarItemTitle}
                    title={l.title}
                  >
                    {l.title}
                  </span>
                  <CloseOutlined
                    className={styles.detailNoteSidebarItemRemove}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (sameId(activeNoteId, noteId)) {
                        void collapseEditor();
                      }
                      onRemoveNote(noteId);
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.detailNoteSidebarEmpty}>暂无关联笔记</div>
        )}
      </aside>

      {showEditor && (
        <div className={styles.detailNoteMain}>
          {loading ? (
            <div className={styles.detailColCenterSpin}>
              <Spin />
            </div>
          ) : editorReady && activeNoteId ? (
            <>
              <div className={styles.detailNoteToolbar}>
                <input
                  className={styles.detailNoteTitleInput}
                  value={title}
                  disabled={readOnly}
                  placeholder="文档标题"
                  onChange={(e) => {
                    const v = e.target.value;
                    setTitle(v);
                    titleRef.current = v;
                    scheduleSave();
                  }}
                />
                {!readOnly && (
                  <Segmented
                    size="small"
                    value={mode}
                    onChange={(v) => setMode(v as LiveEditorMode)}
                    options={[
                      { label: "预览", value: "live" },
                      { label: "源码", value: "source" },
                    ]}
                  />
                )}
                <Tooltip title="大纲">
                  <Button
                    size="small"
                    type={tocVisible ? "primary" : "text"}
                    icon={<BarsOutlined />}
                    onClick={() => setTocVisible((v) => !v)}
                  />
                </Tooltip>
                <Tooltip title="分享链接">
                  <Button
                    size="small"
                    type="text"
                    icon={<ShareAltOutlined />}
                    loading={shareLoading}
                    onClick={() => void handleShare()}
                  />
                </Tooltip>
                {!readOnly && (
                  <Button
                    size="small"
                    icon={favorited ? <StarFilled /> : <StarOutlined />}
                    loading={favLoading}
                    onClick={() => void handleToggleFavorite()}
                  >
                    {favorited ? "已收藏" : "收藏"}
                  </Button>
                )}
                {!readOnly && (
                  <Button
                    size="small"
                    type="primary"
                    loading={saveStatus === "saving"}
                    onClick={() => void saveNow()}
                  >
                    保存
                  </Button>
                )}
                {readOnly && (
                  <span className={styles.detailNoteReadOnlyTag}>只读</span>
                )}
              </div>
              <div className={styles.detailNoteEditorBody}>
                <MarkdownLiveEditor
                  key={activeNoteId}
                  ref={editorRef}
                  mode={mode}
                  value={content}
                  readOnly={readOnly}
                  onChange={(v) => {
                    setContent(v);
                    contentRef.current = v;
                    scheduleSave();
                  }}
                  onUploadImage={uploadChatImage}
                  onSave={saveNow}
                  placeholder="笔记内容（支持 Markdown，可直接粘贴图片）"
                />
                {tocVisible && (
                  <div className={styles.detailNoteTocPanel}>
                    <div className={styles.detailNoteTocHeader}>大纲</div>
                    <div className={styles.detailNoteTocList}>
                      {toc.length === 0 ? (
                        <span className={styles.detailNoteTocEmpty}>
                          暂无标题
                        </span>
                      ) : (
                        toc.map((it) => (
                          <div
                            key={it.index}
                            className={styles.detailNoteTocItem}
                            style={{ paddingLeft: 8 + (it.level - 1) * 14 }}
                            onClick={() => handleTocClick(it)}
                            title={it.text}
                          >
                            {it.text}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
