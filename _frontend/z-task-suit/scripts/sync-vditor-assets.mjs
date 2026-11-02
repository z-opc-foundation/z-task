/**
 * 把 vditor 的**运行时静态资源**同步到 `public/vditor/dist`。
 *
 * ## 为什么要这一步
 *
 * `MarkdownLiveEditor`（`@yuku123/z-markdown-component`）用的是 vditor 的 **IR 模式**，
 * vditor 在运行时会去**同源**拉这些资源：
 * <pre>
 *   /vditor/dist/js/i18n/zh_CN.js       // 中文界面文案（缺了整块 UI 变英文/报 404）
 *   /vditor/dist/js/lute/lute.min.js    // markdown 解析器（缺了编辑区不渲染）
 *   /vditor/dist/js/icons/ant.js        // 工具栏图标（缺了按钮全是空白）
 *   /vditor/dist/js/mermaid/mermaid.min.js  // Mermaid 图表（缺了图渲染不出来）
 *   /vditor/dist/css/**、/vditor/dist/images/**  // 主题、表情、content-theme
 * </pre>
 *
 * 这些**不是** npm import 能解决的（vditor 内部按路径字符串去 fetch），
 * 必须由宿主的静态目录提供。
 *
 * ## 为什么不直接把资源提交进仓库
 *
 * `node_modules/vditor/dist` 里这些子目录合计 ~7MB，其中 `lute`(3.6M) + `mermaid`(3.4M)
 * 是二进制级的大块头。提交进 git 会让每次 clone 都多背 7MB，
 * 而它们 100% 可以从 `vditor` 依赖还原 ⇒ **派生成物不入库**，
 * 由本脚本在 dev / build 前生成（见 package.json 的 predev / prebuild）。
 *
 * ## 只拷必需子集
 *
 * 整个 `dist` 是 23MB（含 `index.js`/`method.js` 等已被 npm import 打包的部分）。
 * 这里只挑 vditor **按路径 fetch** 的那几个目录，避免把 23MB 全塞进产物。
 */
import {cp, mkdir, rm, stat} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SUIT_ROOT = path.resolve(HERE, '..')
const SRC = path.join(SUIT_ROOT, 'node_modules/vditor/dist')
const DEST = path.join(SUIT_ROOT, 'public/vditor/dist')

/** vditor 运行时会按路径 fetch 的子集 */
const SUBDIRS = [
    'css',
    'images',
    'js/i18n',
    'js/lute',
    'js/icons',
    'js/mermaid',
]

async function main() {
    if (!existsSync(SRC)) {
        console.error(`[vditor-assets] 找不到 ${SRC}`)
        console.error('[vditor-assets] 先执行 npm install（vditor 是 z-task-component 的 peer 依赖）')
        process.exit(1)
    }

    await rm(DEST, {recursive: true, force: true})
    let copied = 0
    for (const rel of SUBDIRS) {
        const from = path.join(SRC, rel)
        if (!existsSync(from)) {
            // lute / mermaid 在某些 vditor 版本里可能换路径 —— 明确提示，不静默跳过
            console.warn(`[vditor-assets] 缺子目录：dist/${rel}（该功能会退化）`)
            continue
        }
        const to = path.join(DEST, rel)
        await mkdir(path.dirname(to), {recursive: true})
        await cp(from, to, {recursive: true})
        copied += 1
    }
    console.log(`[vditor-assets] 已同步 ${copied}/${SUBDIRS.length} 个子目录 → public/vditor/dist`)
}

main().catch((e) => {
    console.error('[vditor-assets] 失败：', e)
    process.exit(1)
})
