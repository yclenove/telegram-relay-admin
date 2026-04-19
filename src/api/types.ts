/** 与后端 /api/v2 返回结构对齐的轻量类型定义。 */

/** 管理端分页列表通用结构（事件、审计等）。 */
export type Paged<T> = {
  items: T[]
  total: number
}

export type BotRow = {
  id: number
  name: string
  is_default: boolean
  is_enabled: boolean
  remark: string
}

export type DestinationRow = {
  id: number
  bot_id: number
  bot_name?: string
  name: string
  chat_id: string
  topic_id?: string
  parse_mode: string
  is_enabled: boolean
}

export type RuleRow = {
  id: number
  name: string
  priority: number
  match_source: string
  match_level: string
  /** JSON 对象字符串，与后端 routing_rules.match_labels 一致 */
  match_labels?: string
  destination_id: number
  is_enabled: boolean
}

export type EventRow = {
  id: number
  event_id: string
  source: string
  level: string
  title?: string
  status: string
  created_at: string
}

/** 单条事件详情（含正文与原始负载） */
export type EventDetailRow = EventRow & {
  message?: string
  labels?: string
  raw_body?: string
  updated_at?: string
}

/** 异步发送任务行 */
export type DispatchJobRow = {
  id: number
  event_id: number
  destination_id: number
  status: string
  attempt_count: number
  max_attempts: number
  last_error: string
  next_attempt_at?: string | null
  locked_at?: string | null
  created_at: string
  updated_at: string
}

/** GET /api/v2/roles/{id}/permissions 响应 */
export type RolePermissionsResponse = {
  role_id: number
  permissions: string[]
}

export type AuditRow = {
  id: number
  actor_user_id: number | null
  action: string
  object_type: string
  object_id: string
  detail: string
  created_at: string
}

export type LoginResult = {
  access_token: string
  /** 刷新令牌；存 localStorage，401 时尝试换取新 access_token */
  refresh_token?: string
  permissions: string[]
}

export type RoleRow = {
  id: number
  code: string
  name: string
}

export type UserSummaryRow = {
  id: number
  username: string
  is_enabled: boolean
  created_at: string
  updated_at: string
  role_ids: number[]
}
