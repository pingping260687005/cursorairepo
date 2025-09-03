import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/data": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false, // 可选：添加日志便于调试
        logLevel: "debug"
      },
      "/api/mapping": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false, // 可选：添加日志便于调试
        logLevel: "debug"
      }
    }
  }
})
