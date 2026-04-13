<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Avatar,
  Bell,
  Connection,
  Cpu,
  Document,
  Expand,
  Fold,
  List,
  Odometer,
  Position,
  UserFilled,
} from '@element-plus/icons-vue'
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

type MenuItem = { path: string; title: string; icon: Component; perm?: string }

/** 菜单项与图标一一对应，提升侧栏扫读性（图标语义近似即可）。 */
const menuItems: MenuItem[] = [
  { path: '/dashboard', title: '仪表盘', icon: Odometer },
  { path: '/bots', title: '机器人', icon: Cpu, perm: 'bot.manage' },
  { path: '/destinations', title: '发送目标', icon: Position, perm: 'bot.manage' },
  { path: '/rules', title: '路由规则', icon: Connection, perm: 'rule.manage' },
  { path: '/events', title: '事件中心', icon: Bell, perm: 'event.read' },
  { path: '/dispatch-jobs', title: '发送任务', icon: List, perm: 'event.read' },
  { path: '/audits', title: '审计日志', icon: Document, perm: 'audit.read' },
  { path: '/roles', title: '角色与权限', icon: UserFilled, perm: 'user.manage' },
  { path: '/users', title: '用户管理', icon: Avatar, perm: 'user.manage' },
]

function canSee(item: MenuItem) {
  if (!item.perm) return true
  return auth.hasPermission(item.perm)
}
</script>

<template>
  <el-container class="app-shell">
    <el-aside :width="collapsed ? '72px' : '228px'" class="aside">
      <div class="brand-row">
        <div class="brand">
          <span v-show="!collapsed" class="brand-text">Telegram 网关</span>
          <span v-show="collapsed" class="brand-mini">TG</span>
        </div>
        <el-button
          class="collapse-trigger"
          :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
          text
          circle
          @click="collapsed = !collapsed"
        >
          <el-icon :size="18">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
        </el-button>
      </div>
      <el-scrollbar class="menu-scroll">
        <el-menu :default-active="activePath" :collapse="collapsed" router class="side-menu">
          <el-menu-item
            v-for="item in menuItems"
            v-show="canSee(item)"
            :key="item.path"
            :index="item.path"
            :route="{ path: item.path }"
          >
            <el-icon class="menu-ico"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container direction="vertical" class="main-column">
      <el-header class="header" height="56px">
        <div class="header-left">
          <div class="title-block">
            <span class="title">{{ (route.meta.title as string) || '' }}</span>
            <el-text size="small" type="info" class="subtitle">Telegram 网关管理台</el-text>
          </div>
        </div>
        <div class="right">
          <!-- 权限码较多时用 Popover 承载全文，顶栏只显示数量，避免挤占标题区。 -->
          <el-popover
            v-if="(auth.permissions ?? []).length"
            placement="bottom-end"
            :width="360"
            trigger="click"
          >
            <template #reference>
              <el-tag size="small" type="info" class="perm-chip" effect="plain">
                已授权 {{ auth.permissions.length }} 项
              </el-tag>
            </template>
            <div class="perm-pop-title">当前 JWT 权限</div>
            <ul class="perm-pop-list">
              <li v-for="p in auth.permissions" :key="p">{{ p }}</li>
            </ul>
          </el-popover>
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
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  background: var(--relay-sidebar-bg);
  transition: width 0.2s ease;
}
.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: var(--relay-space-sm) var(--relay-space-md);
  border-bottom: 1px solid var(--el-border-color-lighter);
  min-height: 52px;
}
.brand {
  flex: 1;
  min-width: 0;
}
.brand-text {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.04em;
  color: var(--el-text-color-primary);
}
.brand-mini {
  display: block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--el-text-color-primary);
  text-align: center;
}
.collapse-trigger {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}
.menu-scroll {
  flex: 1;
}
.side-menu {
  border-right: none;
  background: transparent;
}
.menu-ico {
  margin-right: 4px;
}
.main-column {
  min-width: 0;
  background: var(--relay-main-surface);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--relay-space-md);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--relay-main-surface);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
}
.header-left {
  min-width: 0;
}
.title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.title {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.subtitle {
  line-height: 1.2;
}
.right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.perm-chip {
  cursor: pointer;
}
.main {
  background: var(--relay-page-bg);
  padding: 0;
}
</style>

<style>
/* Popover 内容非 scoped，单独命名避免污染 */
.perm-pop-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.perm-pop-list {
  margin: 0;
  padding-left: 18px;
  max-height: 280px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.65;
  word-break: break-all;
}
</style>
