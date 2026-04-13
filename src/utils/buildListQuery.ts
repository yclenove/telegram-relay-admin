/**
 * 将列表查询参数序列化为 URLSearchParams，避免各 API 拼装逻辑分叉。
 * 空字符串与 undefined 不传，便于后端使用默认分页。
 */
export function buildEventsQueryParams(p: {
  limit?: number
  offset?: number
  source?: string
  level?: string
  status?: string
}): string {
  const sp = new URLSearchParams()
  if (p.limit != null) sp.set('limit', String(p.limit))
  if (p.offset != null) sp.set('offset', String(p.offset))
  if (p.source) sp.set('source', p.source)
  if (p.level) sp.set('level', p.level)
  if (p.status) sp.set('status', p.status)
  return sp.toString()
}

export function buildAuditsQueryParams(p: {
  limit?: number
  offset?: number
  action?: string
  object_type?: string
  object_id?: string
  actor_user_id?: string
  created_after?: string
  created_before?: string
}): string {
  const sp = new URLSearchParams()
  if (p.limit != null) sp.set('limit', String(p.limit))
  if (p.offset != null) sp.set('offset', String(p.offset))
  if (p.action) sp.set('action', p.action)
  if (p.object_type) sp.set('object_type', p.object_type)
  if (p.object_id) sp.set('object_id', p.object_id)
  if (p.actor_user_id) sp.set('actor_user_id', p.actor_user_id)
  if (p.created_after) sp.set('created_after', p.created_after)
  if (p.created_before) sp.set('created_before', p.created_before)
  return sp.toString()
}

export function buildDispatchJobsQueryParams(p: {
  limit?: number
  offset?: number
  status?: string
}): string {
  const sp = new URLSearchParams()
  if (p.limit != null) sp.set('limit', String(p.limit))
  if (p.offset != null) sp.set('offset', String(p.offset))
  if (p.status) sp.set('status', p.status)
  return sp.toString()
}
