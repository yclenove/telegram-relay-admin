<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as adminApi from '@/api/admin'
import type { NotifyTestPayload } from '@/api/admin'
import { getErrorMessage } from '@/utils/error'

const formRef = ref<FormInstance>()
const submitting = ref(false)
const lastResult = ref<{ event_db_id: number; status: string } | null>(null)

const form = reactive({
  title: '管理台测试',
  message: '这是一条由 notify-test 入队的事件。',
  source: 'admin-notify-test',
  level: 'info',
  event_id: '',
  labelsJson: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  message: [{ required: true, message: '请填写内容', trigger: 'blur' }],
  source: [{ required: true, message: '请填写来源', trigger: 'blur' }],
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate().catch(() => Promise.reject())
  let labels: Record<string, string> | undefined
  const raw = form.labelsJson.trim()
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        ElMessage.error('labels 须为 JSON 对象，例如 {"env":"prod"}')
        return
      }
      labels = parsed as Record<string, string>
    } catch {
      ElMessage.error('labels JSON 无法解析')
      return
    }
  }
  submitting.value = true
  lastResult.value = null
  try {
    const payload: NotifyTestPayload = {
      title: form.title.trim(),
      message: form.message,
      source: form.source.trim(),
      level: form.level.trim() || undefined,
      event_id: form.event_id.trim() || undefined,
      labels,
    }
    const res = await adminApi.testNotify(payload)
    lastResult.value = res
    ElMessage.success(`已入队 event_db_id=${res.event_db_id}`)
  } catch (e) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <el-alert type="info" show-icon :closable="false" class="hint">
      使用已登录 JWT 调用 <code>POST /api/v2/notify-test</code>，无需在浏览器配置 <code>AUTH_TOKEN</code>；需
      <code>bot.manage</code> 权限，服务端会写审计 <code>notify.test</code>。
    </el-alert>
    <el-card shadow="never" class="card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="message">
          <el-input v-model="form.message" type="textarea" :rows="5" maxlength="8000" show-word-limit />
        </el-form-item>
        <el-form-item label="来源" prop="source">
          <el-input v-model="form.source" maxlength="200" placeholder="用于规则 match_source" />
        </el-form-item>
        <el-form-item label="级别">
          <el-input v-model="form.level" maxlength="64" placeholder="可选，如 info / warning" />
        </el-form-item>
        <el-form-item label="event_id">
          <el-input v-model="form.event_id" maxlength="256" placeholder="可选，省略则由服务生成" />
        </el-form-item>
        <el-form-item label="labels">
          <el-input
            v-model="form.labelsJson"
            type="textarea"
            :rows="3"
            placeholder='可选 JSON 对象，如 {"env":"prod"}'
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">提交测试</el-button>
        </el-form-item>
      </el-form>
      <el-descriptions v-if="lastResult" :column="1" border title="上次响应" class="result">
        <el-descriptions-item label="event_db_id">{{ lastResult.event_db_id }}</el-descriptions-item>
        <el-descriptions-item label="status">{{ lastResult.status }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
}
.hint {
  margin-bottom: var(--relay-space-md);
}
.card {
  border-radius: 12px;
}
.form {
  max-width: 640px;
}
.result {
  margin-top: var(--relay-space-lg);
}
</style>
