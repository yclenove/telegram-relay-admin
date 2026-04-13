<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { BotRow } from '@/api/types'
import { getErrorMessage, isMessageBoxUserDismiss } from '@/utils/error'

const list = ref<BotRow[]>([])
const loading = ref(false)
const createForm = ref({ name: '', bot_token: '', remark: '', is_default: false })

const dialogVisible = ref(false)
const editing = ref<BotRow | null>(null)
const editForm = reactive({
  name: '',
  remark: '',
  is_enabled: true,
  is_default: false,
  bot_token: '',
})

async function load() {
  loading.value = true
  try {
    list.value = await adminApi.fetchBots()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  if (!createForm.value.name || !createForm.value.bot_token) {
    ElMessage.warning('请填写名称与 Bot Token')
    return
  }
  try {
    await adminApi.createBot(createForm.value)
    ElMessage.success('已创建')
    createForm.value = { name: '', bot_token: '', remark: '', is_default: false }
    await load()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  }
}

function openEdit(row: BotRow) {
  editing.value = row
  editForm.name = row.name
  editForm.remark = row.remark
  editForm.is_enabled = row.is_enabled
  editForm.is_default = row.is_default
  editForm.bot_token = ''
  dialogVisible.value = true
}

async function onSaveEdit() {
  if (!editing.value) return
  if (!editForm.name.trim()) {
    ElMessage.warning('名称不能为空')
    return
  }
  try {
    const payload: Parameters<typeof adminApi.patchBot>[1] = {
      name: editForm.name.trim(),
      remark: editForm.remark,
      is_enabled: editForm.is_enabled,
      is_default: editForm.is_default,
    }
    // 仅在填写新 Token 时提交，避免误传空串覆盖服务端逻辑
    if (editForm.bot_token.trim()) payload.bot_token = editForm.bot_token.trim()
    await adminApi.patchBot(editing.value.id, payload)
    ElMessage.success('已保存')
    dialogVisible.value = false
    await load()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  }
}

async function onDelete(row: BotRow) {
  try {
    await ElMessageBox.confirm(`确定删除机器人「${row.name}」？其下发送目标与关联规则将一并删除。`, '确认', {
      type: 'warning',
    })
    await adminApi.deleteBot(row.id)
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
    <header class="relay-section">
      <h2 class="relay-page-title">机器人</h2>
      <p class="relay-page-desc">管理 Telegram Bot 凭据与默认实例；创建后可在「发送目标」中绑定 Chat。</p>
    </header>
    <el-card shadow="never" class="relay-toolbar-card">
      <el-form :inline="true" label-width="100px">
        <el-form-item label="名称"><el-input v-model="createForm.name" placeholder="机器人名称" /></el-form-item>
        <el-form-item label="Bot Token">
          <el-input v-model="createForm.bot_token" placeholder="从 BotFather 获取" show-password />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="createForm.remark" /></el-form-item>
        <el-form-item label="默认"><el-switch v-model="createForm.is_default" /></el-form-item>
        <el-form-item><el-button type="primary" @click="onCreate">创建</el-button></el-form-item>
      </el-form>
    </el-card>
    <div class="relay-table-wrap">
      <el-table v-loading="loading" :data="list" stripe border size="small">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="is_default" label="默认" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_default ? 'success' : 'info'" size="small">{{ row.is_default }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_enabled" label="启用" width="88">
        <template #default="{ row }">
          <el-tag :type="row.is_enabled ? 'success' : 'info'" size="small">{{ row.is_enabled }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
    <div class="relay-actions-footer">
      <el-button @click="load">刷新</el-button>
    </div>

    <el-dialog v-model="dialogVisible" title="编辑机器人" width="520px" destroy-on-close @closed="editing = null">
      <el-form label-width="108px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="editForm.is_enabled" />
        </el-form-item>
        <el-form-item label="默认机器人">
          <el-switch v-model="editForm.is_default" />
        </el-form-item>
        <el-form-item label="新 Token">
          <el-input v-model="editForm.bot_token" type="password" show-password autocomplete="new-password" />
          <div class="sub">留空表示不更换 Token</div>
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
.sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
