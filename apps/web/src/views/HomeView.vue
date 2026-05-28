<script setup lang="ts">
import { useTheme } from '@gocell/core'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <main>
    <h1>gocell-web</h1>
    <button
      class="v1-btn"
      type="button"
      :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
      @click="toggleTheme"
    >
      {{ theme === 'light' ? 'Dark' : 'Light' }}
    </button>
  </main>
</template>
