import { TeamOutlined } from "@ant-design/icons";
import { message, Modal, Select } from "antd";
import { useState } from "react";
import {type TodoProjectSummary} from "../../services/todo-api";
import {searchScheduleStaff} from "../../services/todo-api";
import {addTodoProjectMember, removeTodoProjectMember} from "../../services/todo-api";
import styles from "./index.module.css";

export interface TodoProjectMembersModalProps {
  open: boolean;
  token: string;
  project: TodoProjectSummary | null;
  /** 当前用户 FT userId（判断是否 owner） */
  myUserId: string;
  onClose: () => void;
  /** 成员变更后刷新（父组件 refreshBundle） */
  onChanged: () => void;
}

/** 取姓名首字作行内头像占位（无姓名时回落为 ?） */
function initialOf(name: string): string {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed.slice(0, 1) : "?";
}

/**
 * 项目成员管理弹窗：owner 可从 apex 员工库搜索加人（自动转共享），成员在其侧栏「加入的」可见。
 */
export default function TodoProjectMembersModal({
  open,
  token,
  project,
  myUserId,
  onClose,
  onChanged,
}: TodoProjectMembersModalProps) {
  const [searchKw, setSearchKw] = useState("");
  const [staffOptions, setStaffOptions] = useState<
    { userId: string; name: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const isOwner = !!project && project.userId === myUserId;

  const handleSearch = async (kw: string) => {
    setSearchKw(kw);
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

  const handleAdd = async (userId: string) => {
    if (!project) return;
    const hit = staffOptions.find((s) => s.userId === userId);
    setBusy(true);
    try {
      await addTodoProjectMember(
        project.id,
        { userId, userName: hit?.name ?? userId },
        token
      );
      message.success("成员已添加，项目已转为共享");
      setSearchKw("");
      setStaffOptions([]);
      onChanged();
    } catch (e) {
      message.error((e as { userMessage?: string })?.userMessage ?? "添加失败");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (memberUserId: string) => {
    if (!project) return;
    setBusy(true);
    try {
      await removeTodoProjectMember(project.id, memberUserId, token);
      message.success("已移除");
      onChanged();
    } catch (e) {
      message.error((e as { userMessage?: string })?.userMessage ?? "移除失败");
    } finally {
      setBusy(false);
    }
  };

  const members = project?.memberDetails ?? [];
  const ownerName = project?.createByName || "owner";

  return (
    <Modal
      title={
        <span>
          <TeamOutlined className={styles.membersTitleIcon} />
          项目成员 · {project?.title ?? ""}
        </span>
      }
      open={open}
      width={400}
      className={`${styles.addModal} ${styles.membersModal}`}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div className={styles.addModalBody}>
        <div className={styles.membersSection}>
          <span className={styles.membersLabel}>
            成员 · {1 + members.length}
          </span>
          <div className={styles.membersList}>
            <div className={styles.membersRow}>
              <span
                className={`${styles.membersAvatar} ${styles.membersAvatarOwner}`}
              >
                {initialOf(ownerName)}
              </span>
              <span className={styles.membersName}>{ownerName}</span>
              <span
                className={`${styles.membersRole} ${styles.membersRoleOwner}`}
              >
                owner
              </span>
            </div>
            {members.map((m) => (
              <div className={styles.membersRow} key={m.userId}>
                <span className={styles.membersAvatar}>
                  {initialOf(m.userName)}
                </span>
                <span className={styles.membersName} title={m.userName}>
                  {m.userName}
                </span>
                <span className={styles.membersRole}>成员</span>
                {isOwner && (
                  <button
                    type="button"
                    className={styles.membersRemove}
                    disabled={busy}
                    onClick={() => handleRemove(m.userId)}
                  >
                    移除
                  </button>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <div className={styles.membersEmpty}>暂无其他成员</div>
            )}
          </div>
        </div>

        {isOwner ? (
          <Select
            className={styles.membersSelect}
            dropdownClassName={styles.addModalDropdown}
            showSearch
            filterOption={false}
            value={searchKw || undefined}
            onSearch={handleSearch}
            onChange={handleAdd}
            disabled={busy}
            options={staffOptions.map((s) => ({
              value: s.userId,
              label: s.name,
            }))}
            notFoundContent={searchKw ? "未找到员工" : "输入姓名/工号搜索"}
            placeholder="从员工库搜索添加成员（apex）"
          />
        ) : (
          <div className={styles.membersDenied}>
            仅项目 owner 可添加/移除成员
          </div>
        )}

        <div className={styles.addModalHint}>
          添加成员后项目自动转为共享，成员在侧栏「加入的」分组可见，可协作事项并接受指派。
        </div>
      </div>
    </Modal>
  );
}
