<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@gocell/core'

const { theme, toggleTheme } = useTheme()

const toggleLabel = computed(() =>
  theme.value === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
)

const toggleText = computed(() => (theme.value === 'light' ? 'Dark' : 'Light'))
</script>

<template>
  <main>
    <h1>gocell-web</h1>
    <button
      class="v1-btn"
      type="button"
      :aria-label="toggleLabel"
      @click="toggleTheme"
    >
      {{ toggleText }}
    </button>
  </main>
</template>
