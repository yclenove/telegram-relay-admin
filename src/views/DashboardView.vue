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
  <div v-loading="loading">
    <header class="relay-section">
      <h2 class="relay-page-title">仪表盘</h2>
      <p class="relay-page-desc">关键运行指标一览；数据来自后端实时统计，可点击刷新更新。</p>
    </header>

    <section v-for="group in statGroups" :key="group.title" class="relay-section stat-group">
      <div class="group-head">
        <el-icon class="group-ico" :size="20" :style="{ color: group.accent }">
          <component :is="groupIcons[group.icon]" />
        </el-icon>
        <div>
          <div class="group-title">{{ group.title }}</div>
          <el-text size="small" type="info">{{ group.desc }}</el-text>
        </div>
      </div>
      <el-row :gutter="16">
        <el-col v-for="k in group.keys" :key="k" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card" :style="{ '--stat-accent': group.accent }">
            <div class="stat-inner">
              <div class="stat-label">{{ labelFor(k) }}</div>
              <div class="stat-value">{{ statValue(k) }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <div class="relay-actions-footer">
      <el-button type="primary" @click="load">
        <el-icon class="btn-ico"><Odometer /></el-icon>
        刷新数据
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.stat-group .group-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: var(--relay-space-sm);
}
.group-ico {
  margin-top: 2px;
}
.group-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}
.stat-card {
  border-radius: var(--relay-radius);
  margin-bottom: var(--relay-space-sm);
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
}
.stat-inner {
  position: relative;
  padding-left: 12px;
}
.stat-inner::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 2px;
  background: var(--stat-accent, var(--el-color-primary));
}
.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.stat-value {
  font-size: 26px;
  font-weight: 600;
  margin-top: 6px;
  letter-spacing: -0.02em;
  color: var(--el-text-color-primary);
}
.btn-ico {
  margin-right: 6px;
  vertical-align: middle;
}
</style>
