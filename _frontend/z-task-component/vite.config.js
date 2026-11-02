import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {safeEmptyOutDir} from '../../build-tools/safe-vite-plugin.mjs'

export default defineConfig({
    plugins: [react(), safeEmptyOutDir()],
    // library mode 的 rollup 不读 tsconfig paths，@/ 必须在 resolve.alias 里再声明一次
    resolve: {
        alias: {'@': path.resolve(__dirname, 'src')},
        dedupe: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons', 'axios', 'dayjs'],
    },
    build: {
        lib: {entry: {index: path.resolve(__dirname, 'src/index.js'), pages: path.resolve(__dirname, 'src/pages.js')}, formats: ['es']},
        outDir: 'dist', emptyOutDir: false,
        /**
         * rollup 的 external 改为**函数式**判定（2026-11-02 待办搬迁时改造）。
         *
         * 原因：字符串数组是**精确匹配**，不是前缀匹配。子路径 import 匹配不到 ⇒
         *   · `highlight.js/lib/core`、`highlight.js/lib/languages/*`
         *   · `@yuku123/z-frontend-common/ui`（子路径入口）
         *   · `@yuku123/z-markdown-component`
         * 这些会被 rollup 当普通依赖**打进本包 dist** ⇒
         *   ① 包体凭空膨胀（highlight.js 一家就 130KB+）；
         *   ② 宿主侧失去「按需语言 / 共享基座单一真源」的分块能力；
         *   ③ 同一份 React/antd 出现**双实例**，hooks 直接报
         *      "Invalid hook call"。
         *
         * ⇒ 凡是「宿主提供、跨包共享」的依赖一律 external，本包只引用不携带。
         */
        rollupOptions: {
            external: (id) =>
                id === 'react' ||
                id === 'react-dom' ||
                id === 'react-dom/client' ||
                id === 'react/jsx-runtime' ||
                id === 'react-router-dom' ||
                id === 'antd' ||
                id === '@ant-design/icons' ||
                id === 'axios' ||
                id === 'dayjs' ||
                // 待办拖拽用 @dnd-kit（来自 z-team 搬迁）
                id === '@dnd-kit/core' ||
                id === '@dnd-kit/sortable' ||
                id === '@dnd-kit/utilities' ||
                // Markdown 渲染栈（z-markdown-component 的 peer 依赖，宿主提供）
                id === 'react-markdown' ||
                id === 'remark-gfm' ||
                id === 'rehype-highlight' ||
                id === 'unified' ||
                id === 'highlight.js' ||
                id.startsWith('highlight.js/') ||
                // vditor（MarkdownLiveEditor）
                id === 'vditor' ||
                // @yuku123/* 一律 external：共享基座 / 兄弟组件包只能有一份真源。
                // 前缀判定覆盖了 z-frontend-common 的三个入口 + z-markdown-component。
                id.startsWith('@yuku123/'),
        },
    },
})
