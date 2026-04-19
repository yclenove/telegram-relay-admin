<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TabPaneName } from 'element-plus'
import { Document, Link, Reading } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { quickGuideFaq, quickGuideIntro, quickGuideSteps } from '@/data/helpContent'

/** GFM 表格/换行等，便于手册可读；内容来自同源静态文件。 */
marked.setOptions({ gfm: true, breaks: true })

const manualText = ref('')
const manualLoading = ref(false)
const manualError = ref('')

const thirdPartyText = ref('')
const thirdPartyLoading = ref(false)
const thirdPartyError = ref('')

const manualHtml = computed(() => {
  if (!manualText.value) return ''
  return marked.parse(manualText.value) as string
})

const thirdPartyHtml = computed(() => {
  if (!thirdPartyText.value) return ''
  return marked.parse(thirdPartyText.value) as string
})

const faqPanels = quickGuideFaq.map((x) => ({ title: x.q, name: x.q, text: x.a }))

async function fetchMd(relativePath: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}${relativePath}`)
    if (!res.ok) return { ok: false, message: `加载失败（HTTP ${res.status}）` }
    return { ok: true, text: await res.text() }
  } catch {
    return { ok: false, message: '网络错误，无法加载文档' }
  }
}

onMounted(async () => {
  manualLoading.value = true
  manualError.value = ''
  const r = await fetchMd('docs/user-manual.md')
  if (r.ok) manualText.value = r.text
  else manualError.value = r.message
  manualLoading.value = false
})

/** 第三方接入文档较大，首次切到 Tab 再拉取，避免拖慢首屏。 */
async function ensureThirdPartyDoc() {
  if (thirdPartyText.value || thirdPartyLoading.value) return
  thirdPartyLoading.value = true
  thirdPartyError.value = ''
  const r = await fetchMd('docs/third-party-integration.md')
  if (r.ok) thirdPartyText.value = r.text
  else thirdPartyError.value = r.message
  thirdPartyLoading.value = false
}

function onTabChange(name: TabPaneName) {
  if (name === 'third-party') void ensureThirdPartyDoc()
}
</script>

<template>
  <div class="help-page">
    <el-tabs type="border-card" class="tabs" @tab-change="onTabChange">
      <el-tab-pane name="quick">
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
      <el-tab-pane name="manual" lazy>
        <template #label>
          <span class="tab-label"><el-icon><Document /></el-icon> 使用手册</span>
        </template>
        <el-skeleton v-if="manualLoading" :rows="8" animated />
        <el-alert v-else-if="manualError" type="warning" :title="manualError" show-icon :closable="false" />
        <div v-else class="manual-scroll">
          <article class="manual-md" v-html="manualHtml" />
        </div>
      </el-tab-pane>
      <el-tab-pane name="third-party" lazy>
        <template #label>
          <span class="tab-label"><el-icon><Link /></el-icon> 第三方接入</span>
        </template>
        <el-skeleton v-if="thirdPartyLoading" :rows="10" animated />
        <el-alert v-else-if="thirdPartyError" type="warning" :title="thirdPartyError" show-icon :closable="false" />
        <div v-else-if="thirdPartyText" class="manual-scroll">
          <article class="manual-md" v-html="thirdPartyHtml" />
        </div>
        <el-text v-else type="info" size="small">切换到本标签后将加载文档。</el-text>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.help-page {
  max-width: min(1100px, 100%);
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
.manual-scroll {
  max-height: min(72vh, 760px);
  overflow: auto;
  padding: 4px 2px 12px;
}
</style>

<!-- v-html 注入节点无 scoped data 属性，排版样式挂在 .manual-md 下避免泄漏 -->
<style>
.manual-md {
  font-size: 14px;
  line-height: 1.65;
  color: var(--el-text-color-primary);
}
.manual-md > *:first-child {
  margin-top: 0;
}
.manual-md h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75em;
  padding-bottom: 0.4em;
  border-bottom: 1px solid var(--el-border-color-lighter);
  letter-spacing: 0.02em;
}
.manual-md h2 {
  font-size: 1.2rem;
  font-weight: 650;
  margin: 1.35em 0 0.55em;
  color: var(--el-text-color-primary);
}
.manual-md h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.1em 0 0.45em;
  color: var(--el-text-color-regular);
}
.manual-md p {
  margin: 0.55em 0;
}
.manual-md ul,
.manual-md ol {
  margin: 0.5em 0;
  padding-left: 1.35em;
}
.manual-md li {
  margin: 0.25em 0;
}
.manual-md table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 1em 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}
.manual-md th,
.manual-md td {
  border: 1px solid var(--el-border-color-lighter);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}
.manual-md th {
  background: var(--el-fill-color-light);
  font-weight: 600;
  color: var(--el-text-color-regular);
}
.manual-md tr:nth-child(even) td {
  background: var(--el-fill-color-blank);
}
.manual-md code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.88em;
  padding: 0.12em 0.4em;
  border-radius: 4px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-extra-light);
}
.manual-md pre {
  margin: 1em 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--el-fill-color-dark);
  border: 1px solid var(--el-border-color-lighter);
  overflow-x: auto;
}
.manual-md pre code {
  padding: 0;
  border: none;
  background: transparent;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}
.manual-md hr {
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  margin: 1.5em 0;
}
.manual-md a {
  color: var(--el-color-primary);
  text-decoration: none;
}
.manual-md a:hover {
  text-decoration: underline;
}
.manual-md strong {
  font-weight: 650;
}
</style>
