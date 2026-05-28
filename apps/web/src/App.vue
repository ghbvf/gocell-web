<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useTheme, useThemeTokens, useLocaleStore, AppShell } from '@gocell/core'
import { useUiStore } from './stores/useUiStore'
import { useGlobalShortcuts } from './composables/useGlobalShortcuts'

// Initialize theme (applies data-theme to <html>)
useTheme()
const { themeConfig } = useThemeTokens()

// Sync locale store → vue-i18n
const { locale: i18nLocale } = useI18n()
const localeStore = useLocaleStore()

// Keep vue-i18n locale in sync with store
watch(
  () => localeStore.locale,
  (val) => {
    i18nLocale.value = val
  },
  { immediate: true },
)

// Global UI state (command palette + sidebar) shared between AppShell and shortcuts
const uiStore = useUiStore()

// Register global keyboard shortcuts; cleanup on unmount
let cleanupShortcuts: (() => void) | undefined

onMounted(() => {
  cleanupShortcuts = useGlobalShortcuts()
})

onBeforeUnmount(() => {
  cleanupShortcuts?.()
})

// Note: AntD ConfigProvider locale is not wired in Batch 0.
// It will be added in a subsequent batch with zh-CN/en-US locale objects.
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <AppShell
      v-model:command-palette-open="uiStore.commandPaletteOpen"
      v-model:sidebar-collapsed="uiStore.sidebarCollapsed"
    >
      <RouterView />
    </AppShell>
  </ConfigProvider>
</template>
