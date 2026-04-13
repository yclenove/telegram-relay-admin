<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { EventDetailRow, EventRow } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

const list = ref<EventRow[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({
  source: '',
  level: '',
  status: '',
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<EventDetailRow | null>(null)

async function load() {
  loading.value = true
  try {
    const offset = (page.value - 1) * pageSize.value
    const { items, total: t } = await adminApi.fetchEvents({
      limit: pageSize.value,
      offset,
      source: filters.source.trim() || undefined,
      level: filters.level.trim() || undefined,
      status: filters.status.trim() || undefined,
    })
    list.value = items
    total.value = t
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function openDetail(row: EventRow) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await adminApi.fetchEvent(row.id)
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

function onSearch() {
  page.value = 1
  load()
}

function onResetFilters() {
  filters.source = ''
  filters.level = ''
  filters.status = ''
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <header class="relay-section">
      <h2 class="relay-page-title">事件中心</h2>
      <p class="relay-page-desc">查看入站事件与送达状态；支持按来源、级别与状态筛选。</p>
    </header>
    <el-card shadow="never" class="relay-toolbar-card">
      <el-form :inline="true" label-width="72px">
        <el-form-item label="来源">
          <el-input v-model="filters.source" placeholder="精确匹配" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="级别">
          <el-input v-model="filters.level" placeholder="精确匹配" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="filters.status" placeholder="如 pending" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onResetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="relay-table-wrap">
      <el-table v-loading="loading" :data="list" stripe border size="small" max-height="520">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="event_id" label="EventID" min-width="160" />
      <el-table-column prop="source" label="来源" width="100" />
      <el-table-column prop="level" label="级别" width="88" />
      <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="created_at" label="时间" min-width="180" />
      <el-table-column label="操作" width="88" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
    <div class="relay-actions-footer">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="load"
        @size-change="load"
      />
      <el-button type="primary" @click="load">刷新当前页</el-button>
    </div>

    <el-drawer v-model="detailVisible" title="事件详情" size="560px" destroy-on-close>
      <el-skeleton v-if="detailLoading" :rows="8" animated />
      <template v-else-if="detail">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="EventID">{{ detail.event_id }}</el-descriptions-item>
          <el-descriptions-item label="来源 / 级别">{{ detail.source }} / {{ detail.level }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="正文">
            <pre class="mono">{{ detail.message }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="Labels（JSON）">
            <pre class="mono">{{ detail.labels }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="Raw（JSON）">
            <pre class="mono small">{{ detail.raw_body }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.created_at }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.mono {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
}
.mono.small {
  max-height: 160px;
}
</style>
