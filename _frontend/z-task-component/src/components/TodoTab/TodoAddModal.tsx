import {isPositiveId, type Id} from "../../utils/id";
import { DatePicker, Input, message, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {type TodoPriority, type TodoProjectBundle, type TodoProjectSummary, type TodoStatus} from "../../services/todo-api";
import {searchScheduleStaff} from "../../services/todo-api";
import {addTodoProjectMember, createTodoItem, updateTodoItem} from "../../services/todo-api";
import styles from "./index.module.css";
// 收集箱哨兵只在渲染期读取，与 TodoSidebar 取自同一常量，保持单一定义点
import {INBOX_PROJECT_ID} from "./index";

/** 列预设：看板某列/项目分组头点 ＋ 时带出的初始字段（status 在创建后校正，后端创建固定 TODO） */
export interface TodoAddPreset {
  status?: TodoStatus;
  priority?: TodoPriority;
  /** 预设指派人（多人） */
  assigneeUserIds?: string[];
  /** 默认所属项目（收集箱哨兵为 INBOX_PROJECT_ID="0"） */
  projectId?: Id;
}

export interface TodoAddModalProps {
  open: boolean;
  token: string;
  /** 当前用户 FT userId（判断项目 owner） */
  myUserId: string;
  /** 当前视图项目（null=非项目视图，默认收集箱） */
  viewProject: TodoProjectSummary | null;
  bundle: TodoProjectBundle | null;
  preset: TodoAddPreset;
  onCancel: () => void;
  onCreated: () => void;
}

/** 包一层 span 绕过 antd 对两字中文按钮自动插空格（“取 消”） */
const BTN_CANCEL = <span>取消</span>;

/**
 * 新建事项弹窗：看板列内 ＋ 入口打开；指派人支持多选、从 apex 员工库远程搜索，
 * 项目内选中非成员时 owner 自动逐个拉其入项目后指派。
 */
export default function TodoAddModal({
  open,
  token,
  myUserId,
  viewProject,
  bundle,
  preset,
  onCancel,
  onCreated,
}: TodoAddModalProps) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  /** 0=收集箱；>0 项目 id */
  /** 当前选中的归属项目 ID；收集箱哨兵 INBOX_PROJECT_ID="0"（不可用 0：字符串 "0" 语义易混）
   *  统一存 string，用 compareIds/isPositiveId 判断，避免 `> 0` 变成字典序比较 */
  const [projectIdSel, setProjectIdSel] = useState<Id>(INBOX_PROJECT_ID);
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  /** 指派人 userId 列表（多选） */
  const [assignees, setAssignees] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<
    { userId: string; name: string }[]
  >([]);
  const [creating, setCreating] = useState(false);

  /** 打开时按视图/列预设重置 */
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDetail("");
    setProjectIdSel(preset.projectId ?? viewProject?.id ?? INBOX_PROJECT_ID);
    setPriority(preset.priority ?? "MEDIUM");
    setDueDate(null);
    setAssignees(preset.assigneeUserIds ?? []);
    setStaffOptions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selProject = useMemo(
    () =>
      isPositiveId(projectIdSel)
        ? [...(bundle?.owned ?? []), ...(bundle?.joined ?? [])].find(
            (p) => p.id === projectIdSel
          ) ?? null
        : null,
    [projectIdSel, bundle]
  );

  /** 指派候选：项目 owner+成员在前，apex 搜索结果补充（去重） */
  const assigneeOptions = useMemo(() => {
    const base: { userId: string; name: string }[] = selProject
      ? [
          {
            userId: selProject.userId,
            name: selProject.createByName || "项目 owner",
          },
          ...(selProject.memberDetails ?? []).map((m) => ({
            userId: m.userId,
            name: m.userName,
          })),
        ]
      : [];
    const ids = new Set(base.map((b) => b.userId));
    for (const s of staffOptions) {
      if (!ids.has(s.userId)) base.push(s);
    }
    return base;
  }, [selProject, staffOptions]);

  const handleSearchStaff = async (kw: string) => {
    if (!kw.trim()) {
      setStaffOptions([]);
      return;
    }
    try {
      const staff = await searchScheduleStaff("", kw.trim(), token);
      setStaffOptions(
        (staff ?? []).map((s) => ({
          userId: String(s.userId),
          name: String(s.name),
        }))
      );
    } catch {
      setStaffOptions([]);
    }
  };

  const handleOk = async () => {
    const t = title.trim();
    if (!t) {
      message.warning("请输入事项标题");
      return;
    }
    // 项目内指派校验：逐个判定非 owner/成员 → owner 自动加成员，非 owner 阻止
    const extraMembers: Array<{ userId: string; userName: string }> = [];
    if (assignees.length > 0 && selProject) {
      for (const userId of assignees) {
        const isMember =
          userId === selProject.userId ||
          (selProject.memberDetails ?? []).some((m) => m.userId === userId);
        if (isMember) continue;
        if (selProject.userId !== myUserId) {
          message.warning(
            "指派对象必须是项目成员，仅项目 owner 可添加新成员，请先请 owner 添加"
          );
          return;
        }
        const hit = assigneeOptions.find((o) => o.userId === userId);
        extraMembers.push({ userId, userName: hit?.name ?? userId });
      }
    }
    setCreating(true);
    try {
      if (selProject) {
        for (const m of extraMembers) {
          await addTodoProjectMember(selProject.id, m, token);
        }
      }
      const created = await createTodoItem(
        {
          title: t,
          detail: detail.trim() || undefined,
          priority,
          dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : undefined,
          projectId: isPositiveId(projectIdSel) ? projectIdSel : undefined,
          assigneeUserIds: assignees,
          // z-team 后端当前仅支持单指派人：首位兜底
          assigneeUserId: assignees[0],
        },
        token
      );
      // 列语义状态校正（后端创建固定 TODO；update 会维护完成人/时间）
      if (preset.status && preset.status !== "TODO") {
        await updateTodoItem(created.id, { status: preset.status }, token);
      }
      message.success("事项已添加");
      onCreated();
    } catch (e) {
      message.error((e as { userMessage?: string })?.userMessage ?? "添加失败");
    } finally {
      setCreating(false);
    }
  };

  const allProjects = [...(bundle?.owned ?? []), ...(bundle?.joined ?? [])];

  return (
    <Modal
      title="新建事项"
      open={open}
      width={440}
      className={styles.addModal}
      onCancel={onCancel}
      onOk={handleOk}
      okText={<span>添加</span>}
      cancelText={BTN_CANCEL}
      confirmLoading={creating}
      destroyOnHidden
    >
      <div className={styles.addModalBody}>
        <Input
          placeholder="事项标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onPressEnter={handleOk}
          maxLength={200}
          autoFocus
        />
        <Input.TextArea
          rows={3}
          placeholder="补充描述（可选）"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <div className={styles.addModalRow}>
          <Select
            className={styles.addModalProject}
            dropdownClassName={styles.addModalDropdown}
            value={projectIdSel}
            onChange={(v) => {
              setProjectIdSel(v);
              setAssignees([]);
            }}
            options={[
              { value: INBOX_PROJECT_ID, label: "收集箱" },
              ...allProjects.map((p) => ({
                value: p.id,
                label: p.title,
              })),
            ]}
          />
          <Select
            className={styles.addModalPriority}
            dropdownClassName={styles.addModalDropdown}
            value={priority}
            onChange={(v) => setPriority(v)}
            options={[
              { value: "HIGH", label: "高优先级" },
              { value: "MEDIUM", label: "中优先级" },
              { value: "LOW", label: "低优先级" },
            ]}
          />
          <DatePicker
            className={styles.addModalDue}
            dropdownClassName={styles.addModalPicker}
            allowClear
            placeholder="截止日期"
            value={dueDate}
            onChange={(d) => setDueDate(d)}
          />
        </div>
        <Select
          mode="multiple"
          popupClassName={styles.addModalDropdown}
          virtual={false}
          allowClear
          showSearch
          filterOption={false}
          /* 收集箱事项后端不写入指派人，未选项目时禁用 */
          disabled={!isPositiveId(projectIdSel)}
          value={assignees}
          onChange={(v) => setAssignees((v as string[]) ?? [])}
          onSearch={handleSearchStaff}
          options={assigneeOptions.map((o) => ({
            value: o.userId,
            label: o.name,
          }))}
          notFoundContent="输入姓名/工号搜索员工"
          placeholder={
            isPositiveId(projectIdSel)
              ? "指派给（可多选，可搜全部员工，非项目成员将自动加入项目）"
              : "收集箱事项不支持指派，请先选择所属项目"
          }
        />
      </div>
    </Modal>
  );
}
