import { RobotOutlined } from "@ant-design/icons";
import { Button, Modal, Select, Space, Tag, Tooltip, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { fetchPersonalAgents, type PersonalAgentData } from "../../services/todo-api";
import {
  dispatchTodoToAgent,
  undispatchTodoItem,
  type TodoAgentDispatchResult,
  type TodoItemView,
} from "../../services/todo-api";
import { isPositiveId, sameId, type Id } from "../../utils/id";
import styles from "./index.module.css";

/**
 * 待办详情里的「交给 Agent」区块。
 *
 * <h3>为什么是「派发一个会话」而不是「派发一个任务」</h3>
 * 一条待办交出去之后，Agent 往往要读文件、发现信息不够要反问、写完产出再回话 ——
 * 这是一段**多轮**的过程，需要一个能随时插话纠偏的对话，而不是一次性任务回执。
 * 所以这里派发的是「该用户某个个人 Agent 的一个会话」，并且会话归组到这条待办
 * 所在的项目空间（后端 createSession 时带 projectSpaceId）。
 *
 * <h3>为什么派发后弹「任务书」而不是直接发出去</h3>
 * 后端只拼任务书、不发消息：发消息 = 一次真实的模型调用（流式、计费、几十秒），
 * 塞在 HTTP 里会让「点一下按钮」变成一个可能超时的长请求；而且用户当轮未必盯着会话，
 * 白烧 token。⇒ 弹窗把任务书亮出来，用户复制/确认后再发，既省钱又让人看得见"派了什么活"。
 */
export interface TodoAgentSectionProps {
  item: TodoItemView;
  token: string;
  /** 派发/取消后刷新父列表 */
  onChanged: () => void;
  /** 打开某个 Agent 会话（父组件若能路由就传，目前非必填） */
  onOpenSession?: (sessionId: Id, agentId: Id) => void;
}

export default function TodoAgentSection({
  item,
  token,
  onChanged,
  onOpenSession,
}: TodoAgentSectionProps) {
  const [agents, setAgents] = useState<PersonalAgentData[]>([]);
  const [pickedAgentId, setPickedAgentId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [kickoff, setKickoff] = useState<TodoAgentDispatchResult | null>(null);

  const dispatched = !!item.agentSessionId;
  const inInbox = !isPositiveId(item.projectId);
  const canDispatch = !dispatched && !inInbox;

  useEffect(() => {
    if (!canDispatch || agents.length > 0) return;
    let mounted = true;
    fetchPersonalAgents(token)
      .then((list) => {
        if (!mounted) return;
        // ⚠ 必须再兜一次：上游异常形态（非数组）会让下面的 options.map 直接崩，
        // 而崩溃点是**整个详情抽屉**（React 抛错 → ErrorBoundary 接管整页），
        // 用户看到的是「页面出错了」，根本看不出是 Agent 列表的问题。
        const safeList = Array.isArray(list) ? list : [];
        setAgents(safeList);
        const first = safeList[0];
        if (first) setPickedAgentId(String(first.id));
      })
      .catch(() => {
        // 拉不到列表不阻断页面：用户点派发时会拿到明确错误
      });
    return () => {
      mounted = false;
    };
  }, [canDispatch, agents.length, token]);

  const agentName = (id: Id | null): string => {
    if (!id) return "";
    const hit = agents.find((a) => sameId(a.id, id));
    return hit?.displayName || `Agent #${id}`;
  };

  const doDispatch = useCallback(async () => {
    if (!pickedAgentId) {
      message.warning("先选一个 Agent");
      return;
    }
    setBusy(true);
    try {
      const result = await dispatchTodoToAgent(item.id, pickedAgentId, token);
      setKickoff(result);
      onChanged();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "派发失败");
    } finally {
      setBusy(false);
    }
  }, [item.id, pickedAgentId, token, onChanged]);

  const doUndispatch = useCallback(async () => {
    setBusy(true);
    try {
      await undispatchTodoItem(item.id, token);
      message.success("已取消派发（会话仍保留在项目空间的聊天记录里）");
      onChanged();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "取消派发失败");
    } finally {
      setBusy(false);
    }
  }, [item.id, token, onChanged]);

  const copyKickoff = useCallback(async () => {
    if (!kickoff) return;
    try {
      await navigator.clipboard?.writeText(kickoff.kickoff);
      message.success("任务书已复制");
    } catch {
      message.warning("复制失败，请手动选中复制");
    }
  }, [kickoff]);

  return (
    <div className={styles.detailSection}>
      <div className={styles.detailSectionTitle}>
        <RobotOutlined /> Agent
      </div>

      {dispatched ? (
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Space size={6} wrap>
            <Tag color="processing">已交给 {agentName(item.agentId) || "Agent"}</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              会话 #{item.agentSessionId}
            </Typography.Text>
          </Space>
          <Space size={6} wrap>
            {onOpenSession && item.agentId ? (
              <Button
                size="small"
                onClick={() => onOpenSession(item.agentSessionId as Id, item.agentId as Id)}
              >
                打开会话
              </Button>
            ) : null}
            <Button size="small" danger loading={busy} onClick={doUndispatch}>
              取消派发
            </Button>
          </Space>
          <div className={styles.detailHint}>
            会话在「聊天记录」的项目空间分组里，随时可以继续追问或纠偏。
          </div>
        </Space>
      ) : inInbox ? (
        <div className={styles.detailHint}>
          收集箱待办没有项目空间。先把它归到某个项目，Agent 才有地方读文件、写产出。
        </div>
      ) : (
        <Space size={6} wrap>
          <Select
            size="small"
            style={{ minWidth: 180 }}
            placeholder="选择 Agent"
            value={pickedAgentId}
            onChange={(v) => setPickedAgentId(v)}
            options={agents.map((a) => ({
              value: String(a.id),
              label: a.displayName || `Agent #${a.id}`,
            }))}
            notFoundContent="还没有个人 Agent"
          />
          <Tooltip title="会开一个归属于本项目的会话，并把任务书交给你确认后发出">
            <Button type="primary" size="small" loading={busy} onClick={doDispatch}>
              交给 Agent
            </Button>
          </Tooltip>
        </Space>
      )}

      <Modal
        open={!!kickoff}
        title="任务书已生成"
        width={720}
        onCancel={() => setKickoff(null)}
        footer={[
          <Button key="copy" onClick={copyKickoff}>
            复制任务书
          </Button>,
          <Button key="ok" type="primary" onClick={() => setKickoff(null)}>
            知道了
          </Button>,
        ]}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          会话已创建并归组到项目「{kickoff?.projectSpaceTitle}」。把下面这段发给它，就等于把活派清楚了
          —— 里面已经带了项目空间的文件清单和同项目其它待办。
        </Typography.Paragraph>
        <pre
          style={{
            maxHeight: 380,
            overflow: "auto",
            background: "rgba(0,0,0,0.03)",
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {kickoff?.kickoff}
        </pre>
      </Modal>
    </div>
  );
}
