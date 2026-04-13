<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { AuditRow } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

const list = ref<AuditRow[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({
  action: '',
  object_type: '',
  object_id: '',
  actor_user_id: '',
})
/** 时间筛选：选中的时刻会转为 RFC3339 传给后端（与 parseOptionalRFC3339 一致）。 */
const createdAfter = ref<Date | null>(null)
const createdBefore = ref<Date | null>(null)

function toISO(d: Date | null): string | undefined {
  if (!d) return undefined
  return d.toISOString()
}

async function load() {
  loading.value = true
  try {
    const offset = (page.value - 1) * pageSize.value
    const { items, total: t } = await adminApi.fetchAudits({
      limit: pageSize.value,
      offset,
      action: filters.action.trim() || undefined,
      object_type: filters.object_type.trim() || undefined,
      object_id: filters.object_id.trim() || undefined,
      actor_user_id: filters.actor_user_id.trim() || undefined,
      created_after: toISO(createdAfter.value),
      created_before: toISO(createdBefore.value),
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
  filters.action = ''
  filters.object_type = ''
  filters.object_id = ''
  filters.actor_user_id = ''
  createdAfter.value = null
  createdBefore.value = null
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <el-card shadow="never" class="mb">
      <el-form :inline="true" label-width="88px">
        <el-form-item label="动作">
          <el-input v-model="filters.action" placeholder="如 bot.update" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="对象类型">
          <el-input v-model="filters.object_type" placeholder="如 bot" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="对象 ID">
          <el-input v-model="filters.object_id" placeholder="精确匹配" clearable style="width: 100px" />
        </el-form-item>
        <el-form-item label="操作人 ID">
          <el-input v-model="filters.actor_user_id" placeholder="用户主键" clearable style="width: 100px" />
        </el-form-item>
        <el-form-item label="起始时间">
          <el-date-picker v-model="createdAfter" type="datetime" placeholder="created_after" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="createdBefore" type="datetime" placeholder="created_before" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onResetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table v-loading="loading" :data="list" stripe border max-height="520">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="actor_user_id" label="操作人" width="96" />
      <el-table-column prop="action" label="动作" width="140" />
      <el-table-column prop="object_type" label="对象类型" width="120" />
      <el-table-column prop="object_id" label="对象 ID" width="100" />
      <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
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
      <el-button @click="load">刷新当前页</el-button>
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
