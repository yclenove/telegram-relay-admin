<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="page">
    <el-result icon="info" title="页面不存在" sub-title="请检查地址是否正确，或从侧栏进入功能模块。">
      <template #extra>
        <el-button type="primary" @click="router.push({ name: 'dashboard' })">返回仪表盘</el-button>
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
