/**
 * 判断是否为 Element Plus MessageBox 的用户取消或关闭（含点 X、ESC）。
 * Promise 会 reject('cancel')；若配置了 distinguishCancelAndClose，关闭可能为 'close'。
 * 与真实接口错误区分，避免误弹「请求失败」类提示。
 */
export function isMessageBoxUserDismiss(err: unknown): boolean {
  return err === 'cancel' || err === 'close'
}

/**
 * 从 axios 错误中提取可读文案，避免 ElMessage 只显示 [object Object]。
 */
export function getErrorMessage(e: unknown, fallback = '请求失败'): string {
  const err = e as { response?: { data?: unknown }; message?: string }
  const data = err.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.error === 'string' && o.error.trim()) return o.error
    // 部分网关/框架返回 { message } 而非 { error }，一并兼容避免落到 [object Object]。
    if (typeof o.message === 'string' && o.message.trim()) return o.message
  }
  if (err.message) return err.message
  return fallback
}
