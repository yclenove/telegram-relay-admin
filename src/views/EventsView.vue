<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { EventRow } from '@/api/types'
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
    <el-card shadow="never" class="mb">
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
    <el-table v-loading="loading" :data="list" stripe border max-height="520">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="event_id" label="EventID" min-width="160" />
      <el-table-column prop="source" label="来源" width="100" />
      <el-table-column prop="level" label="级别" width="88" />
      <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="created_at" label="时间" min-width="180" />
    </el-table>
    <div class="footer">
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
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: var(--relay-space-md, 16px);
}
.footer {
  margin-top: var(--relay-space-md, 16px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
