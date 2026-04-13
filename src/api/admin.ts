import { http } from './http'
import type {
  AuditRow,
  BotRow,
  DestinationRow,
  EventRow,
  LoginResult,
  RoleRow,
  RuleRow,
  UserSummaryRow,
} from './types'

/** 封装管理端 REST 调用，页面只关心业务方法名与类型。 */

export async function login(username: string, password: string): Promise<LoginResult> {
  const { data } = await http.post<LoginResult>('/api/v2/auth/login', { username, password })
  return data
}

export async function fetchDashboard(): Promise<Record<string, number>> {
  const { data } = await http.get<Record<string, number>>('/api/v2/dashboard')
  return data
}

export async function fetchBots(): Promise<BotRow[]> {
  const { data } = await http.get<BotRow[]>('/api/v2/bots')
  return data
}

export async function createBot(payload: {
  name: string
  bot_token: string
  remark: string
  is_default: boolean
}): Promise<unknown> {
  const { data } = await http.post('/api/v2/bots', payload)
  return data
}

export async function fetchDestinations(): Promise<DestinationRow[]> {
  const { data } = await http.get<DestinationRow[]>('/api/v2/destinations')
  return data
}

export async function createDestination(payload: {
  bot_id: number
  name: string
  chat_id: string
  parse_mode: string
}): Promise<unknown> {
  const { data } = await http.post('/api/v2/destinations', payload)
  return data
}

export async function fetchRules(): Promise<RuleRow[]> {
  const { data } = await http.get<RuleRow[]>('/api/v2/rules')
  return data
}

export async function createRule(payload: {
  name: string
  priority: number
  match_source: string
  match_level: string
  destination_id: number
}): Promise<unknown> {
  const { data } = await http.post('/api/v2/rules', payload)
  return data
}

export async function fetchEvents(): Promise<EventRow[]> {
  const { data } = await http.get<EventRow[]>('/api/v2/events')
  return data
}

export async function fetchAudits(): Promise<AuditRow[]> {
  const { data } = await http.get<AuditRow[]>('/api/v2/audits')
  return data
}

export async function fetchRoles(): Promise<RoleRow[]> {
  const { data } = await http.get<RoleRow[]>('/api/v2/roles')
  return data
}

export async function fetchUsers(): Promise<UserSummaryRow[]> {
  const { data } = await http.get<UserSummaryRow[]>('/api/v2/users')
  return data
}

export async function createUser(payload: {
  username: string
  password: string
  is_enabled?: boolean
  role_ids: number[]
}): Promise<UserSummaryRow> {
  const { data } = await http.post<UserSummaryRow>('/api/v2/users', payload)
  return data
}

export async function patchUser(
  id: number,
  payload: { is_enabled?: boolean; password?: string; role_ids?: number[] },
): Promise<UserSummaryRow> {
  const { data } = await http.patch<UserSummaryRow>(`/api/v2/users/${id}`, payload)
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(`/api/v2/users/${id}`)
}
