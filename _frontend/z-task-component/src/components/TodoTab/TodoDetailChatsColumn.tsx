import {toId, sameId, type Id} from "../../utils/id";
import { CloseOutlined, MessageOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Select } from "antd";
import { useState } from "react";
import {
  createScenarioInstance,
  type TodoItemView,
  type TodoLink,
} from "../../services/todo-api";
import styles from "./index.module.css";
import { removeProjectLink } from "./todoLinkUtils";

const SUPER_COMMON_SCENARIO_CODE = "super_common";

function openProjectInNewTab(projectId: Id) {
  window.open(
    `${window.location.origin}/workspace?projectId=${projectId}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export interface TodoDetailChatsColumnProps {
  item: TodoItemView;
  projectLinks: TodoLink[];
  chatOptions: { value: Id; label: string }[];
  token: string;
  onPatchLinks: (links: TodoLink[]) => void;
}

export function TodoDetailChatsColumn({
  item,
  projectLinks,
  chatOptions,
  token,
  onPatchLinks,
}: TodoDetailChatsColumnProps) {
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatName, setChatName] = useState(item.title);
  const [creatingChat, setCreatingChat] = useState(false);

  const handleCreateChat = async () => {
    const name = chatName.trim() || item.title;
    setCreatingChat(true);
    try {
      const instance = await createScenarioInstance(
        {
          name,
          description: `由工作待办事项「${item.title}」发起`,
          workspace_path: "",
          scenario_code: SUPER_COMMON_SCENARIO_CODE,
          // 溯源信息必须走 extend_params：后端 ScenarioInstanceCreateRequest
          // 只有 name/description/workspacePath/scenarioCode/source/extendParams
          // 六个字段，原先传的 tags 不在其中，会被 Jackson 静默丢弃
          // （该值类型还是 object，而 extend_params 约定是 Record<string,string>）。
          extend_params: { source: "work_todo", todo_item_id: String(item.id) },
        },
        token
      );
      onPatchLinks([
        ...item.links,
        { type: "project", id: toId(instance.id), title: name },
      ]);
      setChatModalOpen(false);
      message.success("群聊已创建");
      openProjectInNewTab(toId(instance.id));
    } catch (e) {
      message.error(
        (e as { userMessage?: string })?.userMessage ?? "创建群聊失败"
      );
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <>
      <div className={styles.detailColToolbar}>
        <Select
          size="small"
          className={styles.detailColToolbarSelect}
          dropdownClassName={styles.detailDropdown}
          showSearch
          placeholder="关联已有群聊"
          optionFilterProp="label"
          options={chatOptions}
          value={null}
          onChange={(v) => {
            const opt = chatOptions.find((c) => c.value === v);
            if (!opt) return;
            if (
              item.links.some(
                (l) => l.type === "project" && sameId(l.id, v)
              )
            ) {
              message.info("该群聊已关联");
              return;
            }
            onPatchLinks([
              ...item.links,
              // Select 选中回调的 v 类型含 null；此处已由 opt 判空保证有效值
              { type: "project", id: v ?? undefined, title: opt.label },
            ]);
          }}
        />
        <Button
          size="small"
          icon={<MessageOutlined />}
          onClick={() => {
            setChatName(item.title);
            setChatModalOpen(true);
          }}
        >
          发起群聊
        </Button>
      </div>

      {projectLinks.length > 0 ? (
        <div className={styles.detailChatList}>
          {projectLinks.map((l) => {
            // FE-PRECISION-FIX: 不能 Number()，会按 float64 抹掉雪花 ID 末位且不可恢复
            const projectId = toId(l.id);
            return (
              <div
                key={`project-${l.id}`}
                className={styles.detailChatListItem}
                onClick={() => openProjectInNewTab(projectId)}
              >
                <MessageOutlined className={styles.detailChatListItemIcon} />
                <span
                  className={styles.detailChatListItemTitle}
                  title={l.title}
                >
                  {l.title}
                </span>
                <CloseOutlined
                  className={styles.detailChatListItemRemove}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onPatchLinks(removeProjectLink(item.links, projectId));
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.detailChatEmpty}>暂无关联群聊</div>
      )}

      <Modal
        title="发起全能群聊"
        open={chatModalOpen}
        width={420}
        className={styles.addModal}
        onCancel={() => setChatModalOpen(false)}
        onOk={handleCreateChat}
        okText="创建并打开"
        cancelText="取消"
        confirmLoading={creatingChat}
        destroyOnHidden
      >
        <div className={styles.addModalBody}>
          <Input
            placeholder="群聊名称（默认取事项标题）"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
          />
          <div className={styles.addModalHint}>
            使用全能场景（super_common）：故障排查、知识咨询、数据分析等均可直接在群内提问，
            由超级场景总控自动路由。创建后将自动关联到本事项并在新标签页打开群聊。
          </div>
        </div>
      </Modal>
    </>
  );
}
