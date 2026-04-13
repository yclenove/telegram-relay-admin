/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端 API 根地址；开发留空时走 Vite 代理，同域 /api */
  readonly VITE_API_BASE_URL: string
  /** 仅开发：Vite 将 /api 转发到的 relay 地址，默认 vite.config 内为 127.0.0.1:8080 */
  readonly VITE_PROXY_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
