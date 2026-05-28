<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import CommandPalette from './CommandPalette.vue'
import AIBottomBar from './AIBottomBar.vue'

/**
 * AppShell — root layout component.
 *
 * CSS grid: sidebar (232px fixed) | main area (flex: 1)
 * Main area: topbar (44px) | content (flex: 1) | AIBottomBar (32px)
 *
 * Sidebar collapsed state is managed locally by AppShell (single source of truth).
 * Command palette open state is also managed here and threaded to both
 * Sidebar (search button) and TopBar (⌘K button).
 */

const sidebarCollapsed = ref(false)
const commandPaletteOpen = ref(false)

function openCommandPalette(): void {
  commandPaletteOpen.value = true
}

function setCommandPaletteOpen(value: boolean): void {
  commandPaletteOpen.value = value
}
</script>

<template>
  <div class="shell">
    <Sidebar
      :collapsed="sidebarCollapsed"
      @update:collapsed="sidebarCollapsed = $event"
      @open-command-palette="openCommandPalette"
    />

    <div class="shell__main">
      <TopBar @open-command-palette="openCommandPalette" />

      <main class="shell__content">
        <slot />
      </main>

      <AIBottomBar />
    </div>

    <CommandPalette
      :open="commandPaletteOpen"
      @update:open="setCommandPaletteOpen"
    />
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg);
}

.shell__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.shell__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
