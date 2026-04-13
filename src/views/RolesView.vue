<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { RoleRow } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

const list = ref<RoleRow[]>([])
const loading = ref(false)
const drawerVisible = ref(false)
const drawerTitle = ref('')
const permLoading = ref(false)
const permList = ref<string[]>([])

async function load() {
  loading.value = true
  try {
    list.value = await adminApi.fetchRoles()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function openPermissions(row: RoleRow) {
  drawerTitle.value = `${row.name}（${row.code}）`
  drawerVisible.value = true
  permLoading.value = true
  permList.value = []
  try {
    const res = await adminApi.fetchRolePermissions(row.id)
    permList.value = res.permissions
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e))
    drawerVisible.value = false
  } finally {
    permLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <header class="relay-section">
      <h2 class="relay-page-title">角色与权限</h2>
      <p class="relay-page-desc">查看系统角色定义；权限码列表为只读，便于对照 JWT 与接口鉴权。</p>
    </header>
    <el-card shadow="never" class="relay-toolbar-card">
      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="角色与权限为只读展示；变更权限码请在数据库或后续「角色管理」能力中配置。"
      />
    </el-card>
    <div class="relay-table-wrap">
      <el-table v-loading="loading" :data="list" stripe border size="small">
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="code" label="代码" width="160" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openPermissions(row)">权限列表</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
    <div class="relay-actions-footer">
      <el-button @click="load">刷新</el-button>
    </div>

    <el-drawer v-model="drawerVisible" :title="`权限：${drawerTitle}`" size="400px">
      <el-skeleton v-if="permLoading" :rows="6" animated />
      <el-scrollbar v-else max-height="70vh">
        <el-empty v-if="!permList.length" description="该角色未绑定任何权限码" />
        <ul v-else class="perm-ul">
          <li v-for="p in permList" :key="p" class="perm-li">{{ p }}</li>
        </ul>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<style scoped>
.perm-ul {
  margin: 0;
  padding-left: 20px;
}
.perm-li {
  font-size: 13px;
  line-height: 1.7;
  word-break: break-all;
}
</style>
