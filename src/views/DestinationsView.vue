<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { BotRow, DestinationRow } from '@/api/types'
import { getErrorMessage, isMessageBoxUserDismiss } from '@/utils/error'

const list = ref<DestinationRow[]>([])
const bots = ref<BotRow[]>([])
const loading = ref(false)
const createForm = ref({ bot_id: 0, name: '', chat_id: '', parse_mode: 'HTML' })

const dialogVisible = ref(false)
const editing = ref<DestinationRow | null>(null)
const editForm = reactive({
  bot_id: 0,
  name: '',
  chat_id: '',
  topic_id: '',
  parse_mode: 'HTML',
  is_enabled: true,
})

async function load() {
  loading.value = true
  try {
    list.value = await adminApi.fetchDestinations()
    bots.value = await adminApi.fetchBots()
    if (!createForm.value.bot_id && bots.value.length) {
      createForm.value.bot_id = bots.value[0].id
    }
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  if (!createForm.value.bot_id || !createForm.value.name || !createForm.value.chat_id) {
    ElMessage.warning('请选择机器人并填写名称与 Chat ID')
    return
  }
  try {
    await adminApi.createDestination({
      bot_id: createForm.value.bot_id,
      name: createForm.value.name,
      chat_id: createForm.value.chat_id,
      parse_mode: createForm.value.parse_mode || 'HTML',
    })
    ElMessage.success('已创建')
    createForm.value = { bot_id: bots.value[0]?.id ?? 0, name: '', chat_id: '', parse_mode: 'HTML' }
    await load()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  }
}

function openEdit(row: DestinationRow) {
  editing.value = row
  editForm.bot_id = row.bot_id
  editForm.name = row.name
  editForm.chat_id = row.chat_id
  editForm.topic_id = row.topic_id ?? ''
  editForm.parse_mode = row.parse_mode || 'HTML'
  editForm.is_enabled = row.is_enabled
  dialogVisible.value = true
}

async function onSaveEdit() {
  if (!editing.value) return
  if (!editForm.name.trim() || !editForm.chat_id.trim()) {
    ElMessage.warning('名称与 Chat ID 不能为空')
    return
  }
  try {
    await adminApi.patchDestination(editing.value.id, {
      bot_id: editForm.bot_id,
      name: editForm.name.trim(),
      chat_id: editForm.chat_id.trim(),
      topic_id: editForm.topic_id,
      parse_mode: editForm.parse_mode || 'HTML',
      is_enabled: editForm.is_enabled,
    })
    ElMessage.success('已保存')
    dialogVisible.value = false
    await load()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  }
}

async function onDelete(row: DestinationRow) {
  try {
    await ElMessageBox.confirm(
      `确定删除发送目标「${row.name}」？依赖该目标的路由规则将一并删除。`,
      '确认',
      { type: 'warning' },
    )
    await adminApi.deleteDestination(row.id)
    ElMessage.success('已删除')
    await load()
  } catch (e: unknown) {
    if (isMessageBoxUserDismiss(e)) return
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
          <el-select v-model="createForm.bot_id" placeholder="选择" style="width: 200px" filterable>
            <el-option v-for="b in bots" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="如 prod-alerts" />
        </el-form-item>
        <el-form-item label="Chat ID">
          <el-input v-model="createForm.chat_id" placeholder="-100..." />
        </el-form-item>
        <el-form-item label="ParseMode">
          <el-select v-model="createForm.parse_mode" style="width: 120px">
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
      <el-table-column prop="is_enabled" label="启用" width="88">
        <template #default="{ row }">
          <el-tag :type="row.is_enabled ? 'success' : 'info'" size="small">{{ row.is_enabled }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button class="mt" @click="load">刷新</el-button>

    <el-dialog v-model="dialogVisible" title="编辑发送目标" width="560px" destroy-on-close @closed="editing = null">
      <el-form label-width="108px">
        <el-form-item label="机器人">
          <el-select v-model="editForm.bot_id" style="width: 100%" filterable>
            <el-option v-for="b in bots" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Chat ID">
          <el-input v-model="editForm.chat_id" />
        </el-form-item>
        <el-form-item label="Topic ID">
          <el-input v-model="editForm.topic_id" placeholder="无主题线程可留空" />
        </el-form-item>
        <el-form-item label="ParseMode">
          <el-select v-model="editForm.parse_mode" style="width: 100%">
            <el-option label="HTML" value="HTML" />
            <el-option label="Markdown" value="Markdown" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="editForm.is_enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSaveEdit">保存</el-button>
      </template>
    </el-dialog>
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
