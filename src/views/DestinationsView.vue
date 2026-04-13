<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { BotRow, DestinationRow } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

const list = ref<DestinationRow[]>([])
const bots = ref<BotRow[]>([])
const loading = ref(false)
const form = ref({ bot_id: 0, name: '', chat_id: '', parse_mode: 'HTML' })

async function load() {
  loading.value = true
  try {
    list.value = await adminApi.fetchDestinations()
    bots.value = await adminApi.fetchBots()
    if (!form.value.bot_id && bots.value.length) {
      form.value.bot_id = bots.value[0].id
    }
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  if (!form.value.bot_id || !form.value.name || !form.value.chat_id) {
    ElMessage.warning('请选择机器人并填写名称与 Chat ID')
    return
  }
  try {
    await adminApi.createDestination({
      bot_id: form.value.bot_id,
      name: form.value.name,
      chat_id: form.value.chat_id,
      parse_mode: form.value.parse_mode || 'HTML',
    })
    ElMessage.success('已创建')
    form.value = { bot_id: bots.value[0]?.id ?? 0, name: '', chat_id: '', parse_mode: 'HTML' }
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
      <template #header>新建发送目标</template>
      <el-form :inline="true" label-width="100px">
        <el-form-item label="机器人">
          <el-select v-model="form.bot_id" placeholder="选择" style="width: 200px" filterable>
            <el-option v-for="b in bots" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="如 prod-alerts" />
        </el-form-item>
        <el-form-item label="Chat ID">
          <el-input v-model="form.chat_id" placeholder="-100..." />
        </el-form-item>
        <el-form-item label="ParseMode">
          <el-select v-model="form.parse_mode" style="width: 120px">
            <el-option label="HTML" value="HTML" />
            <el-option label="Markdown" value="Markdown" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onCreate">创建</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-table v-loading="loading" :data="list" stripe border>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="bot_name" label="机器人" min-width="120" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="chat_id" label="Chat ID" />
      <el-table-column prop="parse_mode" label="格式" width="100" />
      <el-table-column prop="is_enabled" label="启用" width="80" />
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
