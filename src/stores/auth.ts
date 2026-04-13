import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as adminApi from '@/api/admin'
import { PERMISSIONS_KEY, TOKEN_KEY } from '@/api/http'

function loadPermissionsFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

/**
 * 管理端登录态：token 与 permissions 均持久化到 localStorage，
 * 避免刷新后 permissions 为空导致路由误判无权限、菜单无法进入子页。
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) ?? '')
  const permissions = ref<string[]>(loadPermissionsFromStorage())

  const isLoggedIn = computed(() => token.value.length > 0)

  function setSession(accessToken: string, perms: string[]) {
    token.value = accessToken
    permissions.value = perms
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms))
  }

  function clearSession() {
    token.value = ''
    permissions.value = []
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PERMISSIONS_KEY)
  }

  async function login(username: string, password: string) {
    const res = await adminApi.login(username, password)
    setSession(res.access_token, res.permissions ?? [])
  }

  function logout() {
    clearSession()
  }

  function hasPermission(code: string) {
    return permissions.value.includes(code) || permissions.value.includes('system.manage')
  }

  return {
    token,
    permissions,
    isLoggedIn,
    login,
    logout,
    hasPermission,
    setSession,
    clearSession,
  }
})
