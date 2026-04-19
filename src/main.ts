import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 样式全量引入；组件由 unplugin-vue-components 按需注册，避免打包体积过大。
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import { router } from './router'
import './style.css'

// 生产环境缺少 API 根地址时，静态托管页面会把 /api 打到前端自身，排障成本高，构建期直接失败更稳妥。
if (import.meta.env.PROD && !String(import.meta.env.VITE_API_BASE_URL || '').trim()) {
  throw new Error('生产构建必须配置 VITE_API_BASE_URL（后端 API 根地址，例如 https://relay.example.com）')
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
