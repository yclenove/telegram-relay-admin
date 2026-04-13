<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { DestinationRow, RuleRow } from '@/api/types'
import { getErrorMessage, isMessageBoxUserDismiss } from '@/utils/error'

const list = ref<RuleRow[]>([])
const destinations = ref<DestinationRow[]>([])
const loading = ref(false)
const form = ref({
  name: '',
  priority: 100,
  match_source: '',
  match_level: '',
  match_labels: '{}',
  destination_id: undefined as number | undefined,
})

/** 新建规则用弹窗承载长表单，列表页只保留表格与刷新。 */
const createDialogVisible = ref(false)
const dialogVisible = ref(false)
const editing = ref<RuleRow | null>(null)
const editForm = reactive({
  name: '',
  priority: 100,
  match_source: '',
  match_level: '',
  match_labels: '{}',
  destination_id: undefined as number | undefined,
  is_enabled: true,
})

const destMap = computed(() => {
  const m = new Map<number, string>()
  for (const d of destinations.value) {
    m.set(d.id, `${d.name} (#${d.id})`)
  }
  return m
})

function destLabel(id: number) {
  return destMap.value.get(id) ?? `#${id}`
}

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

function openCreateDialog() {
  form.value = {
    name: '',
    priority: 100,
    match_source: '',
    match_level: '',
    match_labels: '{}',
    destination_id: undefined,
  }
  createDialogVisible.value = true
}

async function onCreate() {
  if (!form.value.name || !form.value.destination_id) {
    ElMessage.warning('请填写规则名并选择发送目标')
    return
  }
  try {
    JSON.parse(form.value.match_labels || '{}')
    await adminApi.createRule({
      name: form.value.name,
      priority: Number(form.value.priority),
      match_source: form.value.match_source,
      match_level: form.value.match_level,
      match_labels: form.value.match_labels.trim() || '{}',
      destination_id: Number(form.value.destination_id),
    })
    ElMessage.success('已创建')
    form.value = {
      name: '',
      priority: 100,
      match_source: '',
      match_level: '',
      match_labels: '{}',
      destination_id: undefined,
    }
    createDialogVisible.value = false
    await load()
  } catch (e: unknown) {
    if (e instanceof SyntaxError) {
      ElMessage.warning('match_labels 须为合法 JSON')
      return
    }
    ElMessage.error(getErrorMessage(e))
  }
}

function openEdit(row: RuleRow) {
  editing.value = row
  editForm.name = row.name
  editForm.priority = row.priority
  editForm.match_source = row.match_source
  editForm.match_level = row.match_level
  editForm.match_labels = row.match_labels?.trim() || '{}'
  editForm.destination_id = row.destination_id
  editForm.is_enabled = row.is_enabled ?? true
  dialogVisible.value = true
}

async function onSaveEdit() {
  if (!editing.value) return
  if (!editForm.name.trim()) {
    ElMessage.warning('规则名不能为空')
    return
  }
  if (editForm.destination_id == null) {
    ElMessage.warning('请选择发送目标')
    return
  }
  try {
    JSON.parse(editForm.match_labels || '{}')
    await adminApi.patchRule(editing.value.id, {
      name: editForm.name.trim(),
      priority: editForm.priority,
      match_source: editForm.match_source,
      match_level: editForm.match_level,
      match_labels: editForm.match_labels.trim() || '{}',
      destination_id: editForm.destination_id,
      is_enabled: editForm.is_enabled,
    })
    ElMessage.success('已保存')
    dialogVisible.value = false
    await load()
  } catch (e: unknown) {
    if (e instanceof SyntaxError) {
      ElMessage.warning('match_labels 须为合法 JSON')
      return
    }
    ElMessage.error(getErrorMessage(e))
  }
}

async function onDelete(row: RuleRow) {
  try {
    await ElMessageBox.confirm(`确定删除规则「${row.name}」？`, '确认', { type: 'warning' })
    await adminApi.deleteRule(row.id)
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
      <h2 class="relay-page-title">路由规则</h2>
      <p class="relay-page-desc">按来源、级别与 Labels 将事件匹配到发送目标；数字优先级越大越优先。</p>
    </header>
    <el-card shadow="never" class="relay-toolbar-card">
      <div class="relay-toolbar-actions">
        <el-text size="small" type="info">规则按优先级匹配；新建请点右侧按钮，避免长表单遮挡表格。</el-text>
        <el-button type="primary" @click="openCreateDialog">新建路由规则</el-button>
      </div>
    </el-card>
    <div class="relay-table-wrap">
      <el-table v-loading="loading" :data="list" stripe border size="small">
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="priority" label="优先级" width="88" />
      <el-table-column prop="match_source" label="来源" />
      <el-table-column prop="match_level" label="级别" />
      <el-table-column label="Labels" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.match_labels || '{}' }}</template>
      </el-table-column>
      <el-table-column label="发送目标" min-width="160">
        <template #default="{ row }">{{ destLabel(row.destination_id) }}</template>
      </el-table-column>
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
      <template #empty>
        <el-empty description="暂无路由规则：事件需经规则匹配后才能投递到目标" :image-size="72">
          <el-button type="primary" @click="openCreateDialog">新建路由规则</el-button>
        </el-empty>
      </template>
    </el-table>
    </div>
    <div class="relay-actions-footer">
      <el-button @click="load">刷新</el-button>
    </div>

    <el-dialog v-model="createDialogVisible" title="新建路由规则" width="600px" destroy-on-close>
      <el-form label-width="100px" @submit.prevent>
        <el-form-item label="规则名">
          <el-input v-model="form.name" placeholder="唯一名称" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="匹配来源">
          <el-input v-model="form.match_source" placeholder="留空=全部" />
        </el-form-item>
        <el-form-item label="匹配级别">
          <el-input v-model="form.match_level" placeholder="留空=全部" />
        </el-form-item>
        <el-form-item label="Labels">
          <el-input
            v-model="form.match_labels"
            type="textarea"
            :rows="3"
            placeholder='JSON 对象，如 {} 或 {"team":"ops"}'
          />
        </el-form-item>
        <el-form-item label="发送目标">
          <el-select v-model="form.destination_id" placeholder="选择目标" style="width: 100%" filterable clearable>
            <el-option
              v-for="d in destinations"
              :key="d.id"
              :label="`${d.name} (#${d.id}, ${d.bot_name || 'bot ' + d.bot_id})`"
              :value="d.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="编辑路由规则" width="560px" destroy-on-close @closed="editing = null">
      <el-form label-width="100px">
        <el-form-item label="规则名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="editForm.priority" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="匹配来源">
          <el-input v-model="editForm.match_source" placeholder="留空=全部" />
        </el-form-item>
        <el-form-item label="匹配级别">
          <el-input v-model="editForm.match_level" placeholder="留空=全部" />
        </el-form-item>
        <el-form-item label="Labels">
          <el-input v-model="editForm.match_labels" type="textarea" :rows="3" placeholder="JSON 对象" />
        </el-form-item>
        <el-form-item label="发送目标">
          <el-select v-model="editForm.destination_id" placeholder="选择目标" style="width: 100%" filterable>
            <el-option
              v-for="d in destinations"
              :key="d.id"
              :label="`${d.name} (#${d.id}, ${d.bot_name || 'bot ' + d.bot_id})`"
              :value="d.id"
            />
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
