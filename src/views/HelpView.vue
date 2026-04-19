<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Document, Reading } from '@element-plus/icons-vue'
import { quickGuideFaq, quickGuideIntro, quickGuideSteps } from '@/data/helpContent'

const manualText = ref('')
const manualLoading = ref(false)
const manualError = ref('')

const faqPanels = quickGuideFaq.map((x) => ({ title: x.q, name: x.q, text: x.a }))

onMounted(async () => {
  manualLoading.value = true
  manualError.value = ''
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}docs/user-manual.md`)
    if (!res.ok) {
      manualError.value = `加载失败（HTTP ${res.status}）`
      return
    }
    manualText.value = await res.text()
  } catch {
    manualError.value = '网络错误，无法加载手册文件'
  } finally {
    manualLoading.value = false
  }
})
</script>

<template>
  <div class="help-page">
    <el-tabs type="border-card" class="tabs">
      <el-tab-pane>
        <template #label>
          <span class="tab-label"><el-icon><Reading /></el-icon> 快速指引</span>
        </template>
        <p class="intro">{{ quickGuideIntro }}</p>
        <el-steps direction="vertical" :active="quickGuideSteps.length" class="steps">
          <el-step v-for="(s, i) in quickGuideSteps" :key="i" :title="s.title" :description="s.description" />
        </el-steps>
        <h3 class="subhead">常见问题</h3>
        <el-collapse>
          <el-collapse-item v-for="p in faqPanels" :key="p.name" :title="p.title" :name="p.name">
            <p class="faq-a">{{ p.text }}</p>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane lazy>
        <template #label>
          <span class="tab-label"><el-icon><Document /></el-icon> 使用手册</span>
        </template>
        <el-skeleton v-if="manualLoading" :rows="8" animated />
        <el-alert v-else-if="manualError" type="warning" :title="manualError" show-icon :closable="false" />
        <pre v-else class="manual-pre">{{ manualText }}</pre>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.help-page {
  max-width: 900px;
}
.tabs {
  border-radius: 12px;
  overflow: hidden;
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.intro {
  color: var(--el-text-color-secondary);
  line-height: 1.65;
  margin: 0 0 var(--relay-space-md);
}
.steps {
  margin-bottom: var(--relay-space-lg);
}
.subhead {
  font-size: 15px;
  margin: 0 0 var(--relay-space-sm);
}
.faq-a {
  margin: 0;
  line-height: 1.65;
  color: var(--el-text-color-regular);
}
.manual-pre {
  margin: 0;
  padding: var(--relay-space-md);
  background: var(--el-fill-color-light);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: min(70vh, 720px);
  overflow: auto;
}
</style>
