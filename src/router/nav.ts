import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import {
  Avatar,
  Bell,
  Connection,
  Cpu,
  Document,
  List,
  Odometer,
  Position,
  QuestionFilled,
  Upload,
  UserFilled,
} from '@element-plus/icons-vue'

/** 与侧栏菜单一一对应的路由子项（单一数据源，避免与 MainLayout 手写菜单漂移）。 */
export const mainLayoutChildRoutes: RouteRecordRaw[] = [
  { path: '', redirect: { name: 'dashboard' } },
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: '仪表盘', menuIcon: Odometer as Component },
  },
  {
    path: 'bots',
    name: 'bots',
    component: () => import('@/views/BotsView.vue'),
    meta: { title: '机器人', perm: 'bot.manage', menuIcon: Cpu as Component, tourAnchor: 'bots' },
  },
  {
    path: 'destinations',
    name: 'destinations',
    component: () => import('@/views/DestinationsView.vue'),
    meta: {
      title: '发送目标',
      perm: 'bot.manage',
      menuIcon: Position as Component,
      tourAnchor: 'destinations',
    },
  },
  {
    path: 'rules',
    name: 'rules',
    component: () => import('@/views/RulesView.vue'),
    meta: { title: '路由规则', perm: 'rule.manage', menuIcon: Connection as Component, tourAnchor: 'rules' },
  },
  {
    path: 'events',
    name: 'events',
    component: () => import('@/views/EventsView.vue'),
    meta: { title: '事件中心', perm: 'event.read', menuIcon: Bell as Component },
  },
  {
    path: 'dispatch-jobs',
    name: 'dispatch-jobs',
    component: () => import('@/views/DispatchJobsView.vue'),
    meta: { title: '发送任务', perm: 'event.read', menuIcon: List as Component },
  },
  {
    path: 'audits',
    name: 'audits',
    component: () => import('@/views/AuditsView.vue'),
    meta: { title: '审计日志', perm: 'audit.read', menuIcon: Document as Component },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { title: '角色与权限', perm: 'user.manage', menuIcon: UserFilled as Component },
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { title: '用户管理', perm: 'user.manage', menuIcon: Avatar as Component },
  },
  {
    path: 'notify-test',
    name: 'notify-test',
    component: () => import('@/views/NotifyTestView.vue'),
    meta: { title: '测试推送', perm: 'bot.manage', menuIcon: Upload as Component },
  },
  {
    path: 'help',
    name: 'help',
    component: () => import('@/views/HelpView.vue'),
    meta: { title: '帮助', menuIcon: QuestionFilled as Component },
  },
]

export type MenuItem = { path: string; title: string; icon: Component; perm?: string; tourAnchor?: string }

/** 从路由表推导侧栏项（仅包含有 menuIcon 的叶子页）。 */
export function menuItemsFromRoutes(routes: RouteRecordRaw[]): MenuItem[] {
  const out: MenuItem[] = []
  for (const r of routes) {
    const icon = r.meta?.menuIcon as Component | undefined
    if (!icon) continue
    const path = r.path.startsWith('/') ? r.path : `/${r.path}`
    out.push({
      path,
      title: (r.meta?.title as string) || r.name?.toString() || '',
      icon,
      perm: r.meta?.perm as string | undefined,
      tourAnchor: r.meta?.tourAnchor as string | undefined,
    })
  }
  return out
}
