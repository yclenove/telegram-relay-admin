<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const from = typeof route.query.from === 'string' ? route.query.from : ''
</script>

<template>
  <div class="page">
    <el-result icon="warning" title="无访问权限" sub-title="当前账号缺少该页面的操作权限，或目标路由不存在。">
      <template #extra>
        <el-space>
          <el-button type="primary" @click="router.push({ name: 'dashboard' })">返回仪表盘</el-button>
          <el-button v-if="from" @click="router.push(from)">返回上一页</el-button>
        </el-space>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
</style>
