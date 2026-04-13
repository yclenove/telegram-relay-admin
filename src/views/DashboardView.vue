<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Bell, Cpu, List, Odometer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import { getErrorMessage } from '@/utils/error'

const stats = ref<Record<string, number>>({})
const loading = ref(false)

const statLabels: Record<string, string> = {
  events_total: '事件总数',
  events_sent: '已发送',
  events_failed: '发送失败',
  events_last_24h: '近 24 小时事件',
  jobs_pending: '待发送任务',
  jobs_failed: '失败任务（累计）',
  jobs_failed_last_24h: '近 24 小时失败任务',
  bots_enabled: '启用中的机器人',
  rules_enabled: '启用中的规则',
}

/** 指标分组：与左侧色条变量对应，便于扫读。 */
const statGroups: { title: string; desc: string; accent: string; keys: string[]; icon: 'events' | 'jobs' | 'config' }[] = [
  {
    title: '事件',
    desc: '入站告警与送达状态概览',
    accent: 'var(--relay-accent-events)',
    keys: ['events_total', 'events_sent', 'events_failed', 'events_last_24h'],
    icon: 'events',
  },
  {
    title: '异步任务',
    desc: '发送队列与失败重试相关',
    accent: 'var(--relay-accent-jobs)',
    keys: ['jobs_pending', 'jobs_failed', 'jobs_failed_last_24h'],
    icon: 'jobs',
  },
  {
    title: '配置',
    desc: '机器人与路由规则启用数量',
    accent: 'var(--relay-accent-config)',
    keys: ['bots_enabled', 'rules_enabled'],
    icon: 'config',
  },
]

/** 同一组内卡片列宽：4 个指标一行排满；3 个各 8 格；2 个各 12 格，避免窄条悬在左侧显得空。 */
function colSpanForGroup(keyCount: number) {
  if (keyCount >= 4) return { xs: 24, sm: 12, md: 6, lg: 6 }
  if (keyCount === 3) return { xs: 24, sm: 12, md: 8, lg: 8 }
  return { xs: 24, sm: 12, md: 12, lg: 12 }
}

function labelFor(k: string) {
  return statLabels[k] ?? k
}

function statValue(k: string) {
  return stats.value[k] ?? 0
}

/** 分组图标与侧栏菜单语义大致对应，便于运营同学快速扫读。 */
const groupIcons = {
  events: Bell,
  jobs: List,
  config: Cpu,
} as const

type StatGroupDef = (typeof statGroups)[number]

/** 该组指标是否全为 0：用于展示「冷启动」说明，避免误以为接口坏了。 */
function groupAllZero(group: StatGroupDef) {
  return group.keys.every((k) => statValue(k) === 0)
}

function zeroHintFor(group: StatGroupDef) {
  if (group.icon === 'events') {
    return '尚无入站事件：上游需调用 notify 写入告警后，此处才会累计；全为 0 属正常冷启动状态。'
  }
  if (group.icon === 'jobs') {
    return '尚无投递任务：事件经路由规则匹配并生成发送任务后才会出现；可与「事件中心」对照排查。'
  }
  return '启用中的机器人/规则数量为当前配置快照；若均为 0，请先到对应菜单创建并打开启用开关。'
}

async function load() {
  loading.value = true
  try {
    stats.value = await adminApi.fetchDashboard()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <!-- 整块承载面 + 更高指标卡：减少首屏下方「全白」与右侧大块留空的观感 -->
  <div v-loading="loading" class="dashboard-page">
    <header class="relay-section dash-header">
      <h2 class="relay-page-title">仪表盘</h2>
      <p class="relay-page-desc">关键运行指标一览；数据来自后端实时统计，可在下方卡片内刷新。</p>
    </header>

    <el-card shadow="never" class="dashboard-surface">
      <section
        v-for="(group, idx) in statGroups"
        :key="group.title"
        class="stat-group"
        :class="{ 'is-last': idx === statGroups.length - 1 }"
      >
        <div class="group-head">
          <el-icon class="group-ico" :size="22" :style="{ color: group.accent }">
            <component :is="groupIcons[group.icon]" />
          </el-icon>
          <div class="group-head-text">
            <div class="group-title">{{ group.title }}</div>
            <el-text size="small" type="info">{{ group.desc }}</el-text>
          </div>
        </div>
        <el-row :gutter="20">
          <el-col v-for="k in group.keys" :key="k" v-bind="colSpanForGroup(group.keys.length)">
            <el-card shadow="hover" class="stat-card" :style="{ '--stat-accent': group.accent }">
              <div class="stat-inner">
                <div class="stat-label">{{ labelFor(k) }}</div>
                <div class="stat-value">{{ statValue(k) }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div v-if="groupAllZero(group)" class="group-zero-hint">
          <el-text size="small" type="info">{{ zeroHintFor(group) }}</el-text>
        </div>
      </section>

      <div class="dashboard-footer">
        <el-button type="primary" size="large" @click="load">
          <el-icon class="btn-ico"><Odometer /></el-icon>
          刷新数据
        </el-button>
        <el-text class="footer-hint" size="small" type="info">上次加载时间以浏览器为准，可多次刷新对齐后端。</el-text>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: 100%;
}

.dash-header {
  margin-bottom: var(--relay-space-sm);
}

/* 浅色承载面：把多组指标收进一块「版面」，视觉上占满主区中部，减轻散点感 */
.dashboard-surface {
  border-radius: calc(var(--relay-radius) + 2px);
  border: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(
    180deg,
    var(--el-bg-color) 0%,
    var(--el-fill-color-lighter) 55%,
    var(--el-bg-color) 100%
  );
  box-shadow: var(--relay-shadow-card, var(--el-box-shadow-lighter));
  transition: box-shadow 0.25s ease;
}

.dashboard-surface:hover {
  box-shadow: var(--relay-shadow-card-hover, var(--el-box-shadow));
}

.dashboard-surface :deep(.el-card__body) {
  padding: var(--relay-space-lg) var(--relay-space-lg) var(--relay-space-md);
}

.stat-group {
  margin-bottom: var(--relay-space-lg);
  padding-bottom: var(--relay-space-lg);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.stat-group.is-last {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.group-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: var(--relay-space-md);
}

.group-ico {
  margin-top: 2px;
  flex-shrink: 0;
}

.group-head-text {
  min-width: 0;
}

.group-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}

.stat-card {
  border-radius: var(--relay-radius);
  margin-bottom: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  min-height: 118px;
  background: linear-gradient(145deg, var(--el-bg-color) 0%, var(--el-fill-color-blank) 100%);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--el-color-primary-light-7);
  box-shadow: var(--relay-shadow-card-hover, 0 8px 24px rgba(0, 0, 0, 0.08));
}

.stat-card :deep(.el-card__body) {
  padding: 18px 20px 18px 20px;
}

.stat-inner {
  position: relative;
  padding-left: 14px;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-inner::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 4px;
  border-radius: 3px;
  background: var(--stat-accent, var(--el-color-primary));
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-top: 10px;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.group-zero-hint {
  margin-top: var(--relay-space-sm);
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
  line-height: 1.55;
}

.dashboard-footer {
  margin-top: var(--relay-space-lg);
  padding-top: var(--relay-space-md);
  border-top: 1px dashed var(--el-border-color-lighter);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--relay-space-md);
}

.footer-hint {
  flex: 1;
  min-width: 200px;
}

.btn-ico {
  margin-right: 6px;
  vertical-align: middle;
}
</style>
