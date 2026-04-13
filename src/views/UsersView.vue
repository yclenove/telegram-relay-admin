<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { RoleRow, UserSummaryRow } from '@/api/types'
import { getErrorMessage, isMessageBoxUserDismiss } from '@/utils/error'

const list = ref<UserSummaryRow[]>([])
const roles = ref<RoleRow[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<UserSummaryRow | null>(null)
const form = reactive({
  username: '',
  password: '',
  is_enabled: true,
  role_ids: [] as number[],
})

const roleMap = computed(() => {
  const m = new Map<number, string>()
  for (const r of roles.value) {
    m.set(r.id, `${r.name} (${r.code})`)
  }
  return m
})

/** 表格中展示可读角色名，避免只显示数字 ID */
function formatRoleLabels(ids: number[]) {
  if (!ids.length) return '—'
  return ids
    .map((id) => roleMap.value.get(id) ?? `#${id}`)
    .join('、')
}

function openCreate() {
  editing.value = null
  form.username = ''
  form.password = ''
  form.is_enabled = true
  form.role_ids = []
  dialogVisible.value = true
}

function openEdit(row: UserSummaryRow) {
  editing.value = row
  form.username = row.username
  form.password = ''
  form.is_enabled = row.is_enabled
  form.role_ids = [...row.role_ids]
  dialogVisible.value = true
}

async function load() {
  loading.value = true
  try {
    list.value = await adminApi.fetchUsers()
    roles.value = await adminApi.fetchRoles()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!form.username.trim()) {
    ElMessage.warning('请填写用户名')
    return
  }
  if (!editing.value && !form.password) {
    ElMessage.warning('新建用户必须设置初始密码')
    return
  }
  if (!form.role_ids.length) {
    ElMessage.warning('请至少选择一个角色')
    return
  }
  try {
    if (editing.value) {
      const payload: { is_enabled: boolean; password?: string; role_ids: number[] } = {
        is_enabled: form.is_enabled,
        role_ids: form.role_ids,
      }
      if (form.password.trim()) payload.password = form.password
      await adminApi.patchUser(editing.value.id, payload)
      ElMessage.success('已保存')
    } else {
      await adminApi.createUser({
        username: form.username.trim(),
        password: form.password,
        is_enabled: form.is_enabled,
        role_ids: form.role_ids,
      })
      ElMessage.success('已创建')
    }
    dialogVisible.value = false
    await load()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  }
}

async function onDelete(row: UserSummaryRow) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.username}」？`, '确认', { type: 'warning' })
    await adminApi.deleteUser(row.id)
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
      <h2 class="relay-page-title">用户管理</h2>
      <p class="relay-page-desc">创建后台账号并绑定角色；权限变更后需用户重新登录以刷新 JWT。</p>
    </header>
    <el-card shadow="never" class="relay-toolbar-card">
      <div class="toolbar">
        <span class="hint">为用户分配角色（多选）。保存后该用户需<strong>重新登录</strong>才会拿到新权限的 JWT。</span>
        <el-button type="primary" @click="openCreate">新增用户</el-button>
      </div>
    </el-card>
    <div class="relay-table-wrap">
      <el-table v-loading="loading" :data="list" stripe border size="small">
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="is_enabled" label="启用" width="88">
        <template #default="{ row }">
          <el-tag :type="row.is_enabled ? 'success' : 'info'" size="small">{{ row.is_enabled }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="200">
        <template #default="{ row }">{{ formatRoleLabels(row.role_ids) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无后台用户" :image-size="72">
          <el-button type="primary" @click="openCreate">新增用户</el-button>
        </el-empty>
      </template>
    </el-table>
    </div>
    <div class="relay-actions-footer">
      <el-button @click="load">刷新</el-button>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" width="520px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!editing" autocomplete="off" />
        </el-form-item>
        <el-form-item :label="editing ? '新密码' : '密码'" :required="!editing">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" />
          <div v-if="editing" class="sub">留空表示不修改密码</div>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.is_enabled" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role_ids" multiple placeholder="选择角色" style="width: 100%" filterable>
            <el-option v-for="r in roles" :key="r.id" :label="`${r.name} (${r.code})`" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
