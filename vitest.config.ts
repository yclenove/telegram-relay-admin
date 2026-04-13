import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// 独立 Vitest 配置，避免与主 Vite 的 defineConfig 类型嵌套冲突（不同 vite 子版本）。
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
