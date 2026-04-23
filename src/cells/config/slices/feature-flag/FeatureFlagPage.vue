<template>
  <div>
    <h2>{{ $t('config.flagTitle', '特性开关') }}</h2>

    <a-alert
      message="Read-Only Mode / 架构限制"
      description="底层架构限制，核心 Feature Flag 当前仅可通过系统配置控制，Web 端保持强制只读观瞄状态。"
      type="info"
      show-icon
      style="margin-bottom: 24px;"
    />

    <a-card>
      <a-list item-layout="horizontal" :data-source="flags" :loading="loading">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.key" :description="item.description || 'No description provided'" />
            <a-tooltip title="本环境不允许前端动态更改开关状态">
              <a-switch
                :checked="item.enabled"
                disabled
              />
            </a-tooltip>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchFlags } from './api'
import type { FeatureFlag } from './types'

const flags = ref<FeatureFlag[]>([])
const loading = ref(false)

const loadFlags = async () => {
  loading.value = true
  try {
    flags.value = await fetchFlags()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFlags()
})
</script>
