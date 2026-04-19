import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { LoginResult } from '@/api/types'

export const TOKEN_KEY = 'telegram_relay_admin_token'
/** 与 auth store 共用，401 时需一并清除 */
export const PERMISSIONS_KEY = 'telegram_relay_admin_permissions'
export const REFRESH_TOKEN_KEY = 'telegram_relay_admin_refresh_token'

type RetryCfg = InternalAxiosRequestConfig & { _retry401?: boolean }

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 创建 Axios 实例并挂请求拦截器。
 * 使用 localStorage 读 token，避免 Pinia 与 axios 循环依赖。
 */
function createHttp(): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  })
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  // 除登录/刷新接口外，401 时优先尝试 refresh；失败则清本地态并回登录页。
  instance.interceptors.response.use(
    (res) => res,
    async (err: unknown) => {
      const ax = err as {
        response?: { status?: number }
        config?: RetryCfg
      }
      const status = ax.response?.status
      const cfg = ax.config
      if (!cfg || status !== 401) {
        return Promise.reject(err)
      }
      const url = cfg.url ?? ''
      if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
        clearAuthStorage()
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
          window.location.assign(`${window.location.origin}${import.meta.env.BASE_URL}login`)
        }
        return Promise.reject(err)
      }
      if (cfg._retry401) {
        clearAuthStorage()
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
          window.location.assign(`${window.location.origin}${import.meta.env.BASE_URL}login`)
        }
        return Promise.reject(err)
      }
      const rt = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!rt) {
        clearAuthStorage()
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
          window.location.assign(`${window.location.origin}${import.meta.env.BASE_URL}login`)
        }
        return Promise.reject(err)
      }
      try {
        const base = import.meta.env.VITE_API_BASE_URL || ''
        const { data } = await axios.post<LoginResult>(`${base}/api/v2/auth/refresh`, { refresh_token: rt })
        localStorage.setItem(TOKEN_KEY, data.access_token)
        if (data.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
        }
        const perms = Array.isArray(data.permissions) ? data.permissions : []
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms))
        cfg._retry401 = true
        cfg.headers = cfg.headers ?? {}
        cfg.headers.Authorization = `Bearer ${data.access_token}`
        return instance(cfg)
      } catch {
        clearAuthStorage()
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
          window.location.assign(`${window.location.origin}${import.meta.env.BASE_URL}login`)
        }
        return Promise.reject(err)
      }
    },
  )
  return instance
}

export const http = createHttp()
