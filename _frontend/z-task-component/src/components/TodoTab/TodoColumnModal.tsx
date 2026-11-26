import { Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import type { TodoStatusColumn } from "../../services/todo-api";
import styles from "./index.module.css";

/** 看板列弹窗预设：add=新增列；rename=重命名已有列（仅改 label） */
export type TodoColumnPreset =
  | { mode: "add" }
  | { mode: "rename"; status: string; label: string };

export interface TodoColumnModalProps {
  /** null=关闭 */
  preset: TodoColumnPreset | null;
  /** 当前列配置（判定内置状态占用与重名） */
  columns: TodoStatusColumn[];
  onCancel: () => void;
  onSubmit: (col: TodoStatusColumn) => void | Promise<void>;
}

/** 内置状态（列可绑定；与后端 TodoItem 常量一致） */
const BUILTIN_STATUSES: { status: string; label: string }[] = [
  { status: "TODO", label: "待办" },
  { status: "DOING", label: "进行中" },
  { status: "DONE", label: "已完成" },
  { status: "ARCHIVED", label: "已归档" },
];

/** 新建自定义状态选项的占位值 */
const CUSTOM_OPTION = "__custom__";

/** 自定义状态 key：C_ + 8 位大写随机（status 列 VARCHAR(16)，后端按 ^[A-Z][A-Z0-9_]{0,15}$ 校验） */
function genCustomStatusKey(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-2).toUpperCase();
  return `C_${rand}${ts}`.slice(0, 10);
}

/**
 * 看板列新增/重命名弹窗：新增时绑定一个内置状态或新建自定义状态（列名默认=状态名）；
 * 重命名仅修改列显示名（状态 key 不变，事项不受影响）。
 */
export default function TodoColumnModal({
  preset,
  columns,
  onCancel,
  onSubmit,
}: TodoColumnModalProps) {
  const [statusSel, setStatusSel] = useState<string>(CUSTOM_OPTION);
  const [customName, setCustomName] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  /** 打开时按模式重置 */
  useEffect(() => {
    if (!preset) return;
    if (preset.mode === "rename") {
      setLabel(preset.label);
    } else {
      setStatusSel(CUSTOM_OPTION);
      setCustomName("");
      setLabel("");
    }
  }, [preset]);

  if (!preset) return null;
  const isRename = preset.mode === "rename";

  /** 未被占用的内置状态（一列一状态，已绑定的不再出现） */
  const usedStatuses = new Set(columns.map((c) => String(c.status)));
  const builtinOptions = BUILTIN_STATUSES.filter(
    (s) => !usedStatuses.has(s.status)
  ).map((s) => ({ value: s.status, label: `内置状态：${s.label}` }));

  /** 自定义状态名即默认列名（列名留空时回填） */
  const effectiveLabel = label.trim() || customName.trim();

  const handleOk = async () => {
    if (preset.mode === "rename") {
      const next = label.trim();
      if (!next) return;
      if (next === preset.label) {
        onCancel();
        return;
      }
      setSaving(true);
      try {
        await onSubmit({ status: preset.status, label: next });
      } finally {
        setSaving(false);
      }
      return;
    }
    if (!effectiveLabel) return;
    const status =
      statusSel === CUSTOM_OPTION ? genCustomStatusKey() : statusSel;
    setSaving(true);
    try {
      await onSubmit({ status, label: effectiveLabel });
    } finally {
      setSaving(false);
    }
  };

  const okDisabled = isRename ? !label.trim() : !effectiveLabel;

  return (
    <Modal
      open
      width={400}
      className={styles.columnModal}
      title={isRename ? "重命名列" : "新增看板列"}
      okText={isRename ? "保存" : "新增"}
      cancelText="取消"
      okButtonProps={{ disabled: okDisabled, loading: saving }}
      onOk={() => {
        void handleOk();
      }}
      onCancel={onCancel}
      destroyOnHidden
    >
      {!isRename && (
        <div className={styles.columnModalField}>
          <span className={styles.columnModalLabel}>绑定状态</span>
          <Select
            className={styles.columnModalControl}
            value={statusSel}
            onChange={(v) => setStatusSel(v)}
            options={[
              { value: CUSTOM_OPTION, label: "＋ 新建自定义状态" },
              ...builtinOptions,
            ]}
          />
        </div>
      )}
      {!isRename && statusSel === CUSTOM_OPTION && (
        <div className={styles.columnModalField}>
          <span className={styles.columnModalLabel}>状态名称</span>
          <Input
            className={styles.columnModalControl}
            placeholder="如：待验收、测试中"
            maxLength={16}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>
      )}
      <div className={styles.columnModalField}>
        <span className={styles.columnModalLabel}>列名</span>
        <Input
          className={styles.columnModalControl}
          placeholder={
            isRename
              ? "输入新的列名"
              : statusSel === CUSTOM_OPTION
              ? "默认与状态名称一致"
              : "默认与状态名一致"
          }
          maxLength={16}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onPressEnter={() => {
            if (!okDisabled) void handleOk();
          }}
        />
      </div>
    </Modal>
  );
}
