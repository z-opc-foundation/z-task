import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        preserveSymlinks: true,
    },
    server: {
        port: 5800,
        proxy: {
            '/api': {
                target: 'http://localhost:8082',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist'
    }
})
