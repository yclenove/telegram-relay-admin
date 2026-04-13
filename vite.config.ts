import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 从 .env / .env.local 读取代理目标，便于本地与不同端口的后端联调。
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080'

  return {
    plugins: [
      vue(),
      // Element Plus 按需自动导入，减小打包体积并避免全量注册组件。
      AutoImport({
        // 自动导入 ElMessage 等 API，避免每个页面手写 import。
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // 开发时 axios 的 baseURL 置空则请求落在同源 /api/*，由 Vite 转发到 relay，避免浏览器 CORS。
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
