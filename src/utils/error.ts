/**
 * 从 axios 错误中提取可读文案，避免 ElMessage 只显示 [object Object]。
 */
export function getErrorMessage(e: unknown, fallback = '请求失败'): string {
  const err = e as { response?: { data?: unknown }; message?: string }
  const data = err.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: string }).error === 'string') {
    return (data as { error: string }).error
  }
  if (err.message) return err.message
  return fallback
}
