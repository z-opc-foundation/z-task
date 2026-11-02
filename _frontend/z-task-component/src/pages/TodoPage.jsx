/**
 * 待办页适配器 —— 把 `TodoTab` 包成 z-task 自己的路由页。
 *
 * ## 为什么需要这一层
 *
 * `TodoTab` 有两个**必填**回调：`onOpenNote` / `onOpenProject`。
 * 它们在 z-team 里的语义是「切到笔记 Tab」/「跳到群聊项目」——
 * 都指向 **z-team 独有的宿主能力**（个人笔记页、群聊场景实例）。
 *
 * z-task 独立壳（suit）里没有这两个宿主，于是这里做**降级适配**：
 *   · `onOpenNote`   —— 笔记详情挂在待办自己的抽屉里（TodoDetailNotesColumn），
 *                      点笔记链接时直接**提示 + 给出跳转指引**，不静默失败。
 *   · `onOpenProject`—— 群聊项目属 z-team，z-task 内无路由 ⇒ 同样给出提示。
 *
 * 未来 z-team 作为宿主接进来时，只要把这两个回调换成真实实现即可，
 * `TodoTab` 本体一行都不用改 —— 这也是「组件下沉、编排留在宿主」的边界。
 *
 * @yuku123/z-task-component
 */
import {useCallback, useState} from 'react'
import {App, Modal} from 'antd'
import TodoTab from '../components/TodoTab/index'

export default function TodoPage() {
    const {message} = App.useApp()
    /** 宿主未接入时的跳转提示 */
    const [hint, setHint] = useState(null)

    const onOpenNote = useCallback((noteId) => {
        setHint({
            title: '个人笔记在 z-team 侧',
            body: `笔记 ${noteId} 属于 z-team 的个人工作台。`
                + '在独立 z-task 壳里打不开 —— 请到「个人工作台 → 笔记」查看。',
        })
    }, [])

    const onOpenProject = useCallback((projectId) => {
        setHint({
            title: '群聊项目在 z-team 侧',
            body: `项目 ${projectId} 是 z-team 的群聊场景实例。`
                + '在独立 z-task 壳里打不开 —— 请到「个人工作台 → 群聊」查看。',
        })
    }, [])

    return (
        <div style={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <TodoTab
                onOpenProject={onOpenProject}
                onOpenNote={onOpenNote}
            />
            <Modal
                open={!!hint}
                title={hint?.title}
                onCancel={() => setHint(null)}
                onOk={() => setHint(null)}
                okText="知道了"
                cancelButtonProps={{style: {display: 'none'}}}
            >
                <p style={{marginBottom: 0}}>{hint?.body}</p>
            </Modal>
        </div>
    )
}
