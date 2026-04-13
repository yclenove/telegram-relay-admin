<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { DestinationRow, RuleRow } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

const list = ref<RuleRow[]>([])
const destinations = ref<DestinationRow[]>([])
const loading = ref(false)
const form = ref({
  name: '',
  priority: 100,
  match_source: '',
  match_level: '',
  destination_id: undefined as number | undefined,
})

async function load() {
  loading.value = true
  try {
    list.value = await adminApi.fetchRules()
    destinations.value = await adminApi.fetchDestinations()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  if (!form.value.name || !form.value.destination_id) {
    ElMessage.warning('请填写规则名并选择发送目标')
    return
  }
  try {
    await adminApi.createRule({
      name: form.value.name,
      priority: Number(form.value.priority),
      match_source: form.value.match_source,
      match_level: form.value.match_level,
      destination_id: Number(form.value.destination_id),
    })
    ElMessage.success('已创建')
    form.value = {
      name: '',
      priority: 100,
      match_source: '',
      match_level: '',
      destination_id: undefined,
    }
    await load()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  }
}

onMounted(load)
</script>

<template>
  <div>
    <el-card shadow="never" class="mb">
      <template #header>新建路由规则</template>
      <el-form :inline="true" label-width="100px">
        <el-form-item label="规则名">
          <el-input v-model="form.name" placeholder="唯一名称" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" :min="0" />
        </el-form-item>
        <el-form-item label="匹配来源">
          <el-input v-model="form.match_source" placeholder="留空=全部" />
        </el-form-item>
        <el-form-item label="匹配级别">
          <el-input v-model="form.match_level" placeholder="留空=全部" />
        </el-form-item>
        <el-form-item label="发送目标">
          <el-select
            v-model="form.destination_id"
            placeholder="选择目标"
            style="width: 280px"
            filterable
            clearable
          >
            <el-option
              v-for="d in destinations"
              :key="d.id"
              :label="`${d.name} (#${d.id}, ${d.bot_name || 'bot ' + d.bot_id})`"
              :value="d.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onCreate">创建</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table v-loading="loading" :data="list" stripe border>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="priority" label="优先级" width="88" />
      <el-table-column prop="match_source" label="来源" />
      <el-table-column prop="match_level" label="级别" />
      <el-table-column prop="destination_id" label="目标 ID" width="96" />
    </el-table>
    <el-button class="mt" @click="load">刷新</el-button>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: var(--relay-space-md, 16px);
}
.mt {
  margin-top: var(--relay-space-sm, 12px);
}
</style>
