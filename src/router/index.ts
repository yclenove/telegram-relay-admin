import type { NavigationGuardReturn } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mainLayoutChildRoutes } from '@/router/nav'

const LoginView = () => import('@/views/LoginView.vue')
const MainLayout = () => import('@/layouts/MainLayout.vue')
const ForbiddenView = () => import('@/views/ForbiddenView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true, title: '登录' } },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
      meta: { public: true, title: '无权限' },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: mainLayoutChildRoutes,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { public: true, title: '页面不存在' },
    },
  ],
})

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
    return { name: 'forbidden', query: { from: to.fullPath } }
  }
  return true
})

const appTitle = 'Telegram 网关管理台'
router.afterEach((to) => {
  const piece = (to.meta.title as string) || ''
  document.title = piece ? `${piece} · ${appTitle}` : appTitle
})
