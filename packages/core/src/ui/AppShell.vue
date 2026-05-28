<script setup lang="ts">
import { ref, computed } from 'vue'
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
 *
 * When the command palette is open, Sidebar and shell__main receive `inert`
 * to prevent AT/keyboard from reaching content behind the dialog (ARIA APG).
 */

const sidebarCollapsed = ref(false)
const commandPaletteOpen = ref(false)

/**
 * When commandPalette is open, returns `true` to set inert on background elements.
 * When closed, returns `undefined` so the attribute is removed from the DOM entirely.
 * v8 ignore: the `|| undefined` branch (false → undefined) is not exercised in tests
 * because jsdom does not reflect inert as a boolean attribute the same way browsers do.
 */
/* v8 ignore next 3 */
const backgroundInert = computed<true | undefined>(() =>
  commandPaletteOpen.value ? true : undefined,
)

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
      :inert="backgroundInert"
      @update:collapsed="sidebarCollapsed = $event"
      @open-command-palette="openCommandPalette"
    />

    <div
      class="shell__main"
      :inert="backgroundInert"
    >
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
