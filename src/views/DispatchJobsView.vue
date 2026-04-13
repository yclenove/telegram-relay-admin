<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { DispatchJobRow } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

const list = ref<DispatchJobRow[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({ status: '' })

async function load() {
  loading.value = true
  try {
    const offset = (page.value - 1) * pageSize.value
    const { items, total: t } = await adminApi.fetchDispatchJobs({
      limit: pageSize.value,
      offset,
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

function onReset() {
  filters.status = ''
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <header class="relay-section">
      <h2 class="relay-page-title">发送任务</h2>
      <p class="relay-page-desc">异步投递队列与重试状态；与事件中心配合排查失败原因。</p>
    </header>
    <el-card shadow="never" class="relay-toolbar-card">
      <el-form :inline="true" label-width="72px">
        <el-form-item label="状态">
          <el-input v-model="filters.status" placeholder="如 pending / sent / failed" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="relay-table-wrap">
      <el-table v-loading="loading" :data="list" stripe border size="small" max-height="520">
      <el-table-column prop="id" label="任务 ID" width="96" />
      <el-table-column prop="event_id" label="事件 ID" width="96" />
      <el-table-column prop="destination_id" label="目标 ID" width="96" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="attempt_count" label="已尝试" width="88" />
      <el-table-column prop="max_attempts" label="上限" width="72" />
      <el-table-column prop="last_error" label="最近错误" min-width="160" show-overflow-tooltip />
      <el-table-column prop="next_attempt_at" label="下次重试" min-width="160" />
      <el-table-column prop="created_at" label="创建时间" min-width="170" />
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
  </div>
</template>
