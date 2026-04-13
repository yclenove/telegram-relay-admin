<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)

const activePath = computed(() => route.path)

function onLogout() {
  auth.logout()
  router.push({ name: 'login' })
}

type MenuItem = { path: string; title: string; perm?: string }
const menuItems: MenuItem[] = [
  { path: '/dashboard', title: '仪表盘' },
  { path: '/bots', title: '机器人', perm: 'bot.manage' },
  { path: '/destinations', title: '发送目标', perm: 'bot.manage' },
  { path: '/rules', title: '路由规则', perm: 'rule.manage' },
  { path: '/events', title: '事件中心', perm: 'event.read' },
  { path: '/audits', title: '审计日志', perm: 'audit.read' },
  { path: '/users', title: '用户管理', perm: 'user.manage' },
]

function canSee(item: MenuItem) {
  if (!item.perm) return true
  return auth.hasPermission(item.perm)
}
</script>

<template>
  <el-container class="app-shell">
    <el-aside :width="collapsed ? '72px' : '220px'" class="aside">
      <div class="brand">
        <span v-show="!collapsed" class="brand-text">Telegram 网关</span>
        <span v-show="collapsed" class="brand-mini">TG</span>
      </div>
      <el-button class="collapse-btn" text size="small" @click="collapsed = !collapsed">
        {{ collapsed ? '展开' : '收起' }}
      </el-button>
      <el-scrollbar>
        <el-menu :default-active="activePath" :collapse="collapsed" router class="side-menu">
          <el-menu-item
            v-for="item in menuItems"
            v-show="canSee(item)"
            :key="item.path"
            :index="item.path"
            :route="{ path: item.path }"
          >
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container direction="vertical">
      <el-header class="header">
        <span class="title">{{ (route.meta.title as string) || '' }}</span>
        <div class="right">
          <el-tag v-if="auth.permissions.length" type="info" size="small" class="perm-tag">
            {{ auth.permissions.join(', ') }}
          </el-tag>
          <el-button type="primary" link @click="onLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <div class="relay-page-inner">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
.aside {
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  transition: width 0.2s ease;
}
.brand {
  padding: var(--relay-space-md, 16px);
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  min-height: 52px;
  display: flex;
  align-items: center;
}
.brand-mini {
  font-size: 14px;
  letter-spacing: 0.05em;
}
.collapse-btn {
  margin: 8px auto 4px;
}
.side-menu {
  border-right: none;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.perm-tag {
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.main {
  background: var(--el-bg-color-page);
  padding: var(--relay-space-md, 16px);
}
</style>
