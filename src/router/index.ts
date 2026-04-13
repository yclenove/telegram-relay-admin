import type { NavigationGuardReturn } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginView = () => import('@/views/LoginView.vue')
const MainLayout = () => import('@/layouts/MainLayout.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const BotsView = () => import('@/views/BotsView.vue')
const DestinationsView = () => import('@/views/DestinationsView.vue')
const RulesView = () => import('@/views/RulesView.vue')
const EventsView = () => import('@/views/EventsView.vue')
const DispatchJobsView = () => import('@/views/DispatchJobsView.vue')
const AuditsView = () => import('@/views/AuditsView.vue')
const RolesView = () => import('@/views/RolesView.vue')
const UsersView = () => import('@/views/UsersView.vue')

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { title: '仪表盘' } },
        { path: 'bots', name: 'bots', component: BotsView, meta: { title: '机器人', perm: 'bot.manage' } },
        {
          path: 'destinations',
          name: 'destinations',
          component: DestinationsView,
          meta: { title: '发送目标', perm: 'bot.manage' },
        },
        { path: 'rules', name: 'rules', component: RulesView, meta: { title: '路由规则', perm: 'rule.manage' } },
        { path: 'events', name: 'events', component: EventsView, meta: { title: '事件中心', perm: 'event.read' } },
        {
          path: 'dispatch-jobs',
          name: 'dispatch-jobs',
          component: DispatchJobsView,
          meta: { title: '发送任务', perm: 'event.read' },
        },
        { path: 'audits', name: 'audits', component: AuditsView, meta: { title: '审计', perm: 'audit.read' } },
        { path: 'roles', name: 'roles', component: RolesView, meta: { title: '角色与权限', perm: 'user.manage' } },
        { path: 'users', name: 'users', component: UsersView, meta: { title: '用户管理', perm: 'user.manage' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

// Vue Router 4 推荐返回值式守卫，避免 next() 弃用警告。
router.beforeEach((to): NavigationGuardReturn => {
  const auth = useAuthStore()
  if (to.meta.public) {
    if (auth.isLoggedIn && to.path === '/login') {
      return { name: 'dashboard' }
    }
    return true
  }
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  const perm = to.meta.perm as string | undefined
  if (perm && !auth.hasPermission(perm)) {
    return { name: 'dashboard' }
  }
  return true
})

const appTitle = 'Telegram 网关管理台'
// 同步浏览器标签标题，便于多标签页区分当前管理模块（登录页无 meta.title 时用「登录」）。
router.afterEach((to) => {
  const piece = (to.meta.title as string) || (to.meta.public ? '登录' : '')
  document.title = piece ? `${piece} · ${appTitle}` : appTitle
})
