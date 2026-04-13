<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('admin')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } catch (e: unknown) {
    ElMessage.error(`登录失败：${getErrorMessage(e)}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-panel">
      <h1 class="title">Telegram 网关</h1>
      <p class="subtitle">管理台登录</p>
      <el-card class="card" shadow="hover">
        <el-form label-position="top" @submit.prevent="onSubmit">
          <el-form-item label="用户名">
            <el-input v-model="username" autocomplete="username" size="large" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="password"
              type="password"
              show-password
              autocomplete="current-password"
              size="large"
            />
          </el-form-item>
          <el-button type="primary" :loading="loading" native-type="submit" size="large" class="submit">
            登录
          </el-button>
        </el-form>
        <p class="hint">
          开发环境：根目录 <code>.env</code> 中 <code>VITE_API_BASE_URL</code> 留空时，由 Vite 将
          <code>/api</code> 代理到 <code>VITE_PROXY_TARGET</code>（默认本机 relay），无需配置跨域。
        </p>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(1200px 600px at 10% 0%, #1e3a5f 0%, transparent 60%),
    radial-gradient(900px 500px at 90% 20%, #312e81 0%, transparent 55%),
    linear-gradient(165deg, #0f172a 0%, #020617 100%);
}
.login-panel {
  width: 100%;
  max-width: 420px;
}
.title {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.02em;
}
.subtitle {
  margin: 0 0 20px;
  font-size: 14px;
  color: #94a3b8;
}
.card {
  border-radius: var(--relay-radius, 12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
}
.submit {
  width: 100%;
  margin-top: 4px;
}
.hint {
  margin-top: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
