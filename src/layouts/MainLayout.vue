<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 品牌区使用 Promotion 作轻量角标，与纯文案侧栏形成视觉锚点。
import { Expand, Fold, Promotion } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { mainLayoutChildRoutes, menuItemsFromRoutes, type MenuItem } from '@/router/nav'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)

const activePath = computed(() => route.path)

function onLogout() {
  auth.logout()
  router.push({ name: 'login' })
}

/** 侧栏项由路由表推导，与 `router/index.ts` 使用同一 `mainLayoutChildRoutes`。 */
const menuItems = computed<MenuItem[]>(() => menuItemsFromRoutes(mainLayoutChildRoutes))

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
          <span class="brand-mark" aria-hidden="true">
            <el-icon :size="22"><Promotion /></el-icon>
          </span>
          <div class="brand-titles">
            <span v-show="!collapsed" class="brand-text">Telegram 网关</span>
            <span v-show="collapsed" class="brand-mini">TG</span>
            <span v-show="!collapsed" class="brand-sub">Relay Admin</span>
          </div>
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
          <el-button type="primary" link class="logout-btn" @click="onLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <div class="relay-page-inner">
          <!-- :key 绑定路由，避免 transition + 异步组件在切换后卡在 leave 态导致主区整片空白 -->
          <router-view v-slot="{ Component }">
            <transition name="relay-view" mode="out-in">
              <component :is="Component" v-if="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  height: 100vh;
  display: flex;
}
.aside {
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    175deg,
    var(--el-fill-color-darker) 0%,
    var(--relay-sidebar-bg) 28%,
    var(--el-fill-color-light) 100%
  );
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
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  color: var(--el-color-primary);
  background: linear-gradient(145deg, var(--el-color-primary-light-9), var(--el-fill-color));
  border: 1px solid var(--el-color-primary-light-7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.brand-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.brand-text {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.04em;
  color: var(--el-text-color-primary);
}
.brand-sub {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
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
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--relay-main-surface);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--relay-space-lg);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(180deg, var(--relay-main-surface) 0%, var(--el-fill-color-blank) 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
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
  font-size: 18px;
  font-weight: 650;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  letter-spacing: 0.02em;
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
  border-radius: 999px;
  padding: 0 12px;
}
.logout-btn {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
}
.logout-btn:hover {
  background: var(--el-fill-color-light);
}
.main {
  flex: 1;
  min-height: 0;
  overflow: auto;
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

/* 侧栏菜单：圆角项 + 激活态渐变，比默认「一条灰」更精致（仅作用于本壳层下的 el-menu） */
.aside .side-menu.el-menu {
  padding: 6px 0 16px;
  border-right: none;
  background: transparent;
}
.aside .side-menu .el-menu-item {
  height: 44px !important;
  line-height: 44px !important;
  margin: 3px 10px;
  border-radius: 10px;
  color: var(--el-text-color-regular);
}
.aside .side-menu .el-menu-item:hover {
  background-color: var(--el-fill-color) !important;
}
.aside .side-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8)) !important;
  color: var(--el-color-primary) !important;
  font-weight: 600;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}
.aside .side-menu.el-menu--collapse .el-menu-item {
  margin: 4px 8px;
  padding: 0 !important;
}

/* 子路由切换：轻量淡入上移，减少「整页硬切」的简陋感 */
.relay-view-enter-active,
.relay-view-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.relay-view-enter-from,
.relay-view-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
