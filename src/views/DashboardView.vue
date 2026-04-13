<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import { getErrorMessage } from '@/utils/error'

const stats = ref<Record<string, number>>({})
const loading = ref(false)

/** 将后端英文 key 转为可读中文，提升仪表盘信息密度 */
const statLabels: Record<string, string> = {
  events_total: '事件总数',
  events_sent: '已发送',
  events_failed: '发送失败',
  jobs_pending: '待发送任务',
  bots_enabled: '启用中的机器人',
  rules_enabled: '启用中的规则',
}

const orderedKeys = computed(() =>
  Object.keys(stats.value).sort((a, b) => {
    const order = Object.keys(statLabels)
    return order.indexOf(a) - order.indexOf(b)
  }),
)

function labelFor(k: string) {
  return statLabels[k] ?? k
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
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col v-for="k in orderedKeys" :key="k" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ labelFor(k) }}</div>
          <div class="stat-value">{{ stats[k] ?? 0 }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-button type="primary" link class="mt" @click="load">刷新</el-button>
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: var(--relay-radius, 10px);
  margin-bottom: var(--relay-space-sm, 12px);
}
.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-top: 8px;
  letter-spacing: -0.02em;
}
.mt {
  margin-top: var(--relay-space-sm, 12px);
}
</style>
