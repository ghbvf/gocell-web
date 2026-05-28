<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { useTheme, useThemeTokens } from '@gocell/core'

// Initialize theme (applies data-theme to <html> at module load, this call
// ensures the singleton is set up for this component tree too)
useTheme()
const { themeConfig } = useThemeTokens()
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <RouterView />
  </ConfigProvider>
</template>
