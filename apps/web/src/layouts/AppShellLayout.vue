<script setup lang="ts">
/**
 * AppShellLayout — dashboard chrome (Sidebar + TopBar + CommandPalette).
 *
 * Parent route for every authenticated/in-shell page; its <RouterView/> renders
 * the matched child. Standalone full-screen routes (login, first-run-setup) are
 * NOT children of this layout — they render directly in App.vue's RouterView,
 * so the layout fork is structural (route tree), not a runtime meta flag.
 *
 * The command-palette / sidebar UI state and global shortcuts live here rather
 * than in App.vue because they only make sense inside the shell.
 */
import { AppShell } from '@gocell/core'
import { useUiStore } from '../stores/useUiStore'
import { useGlobalShortcuts } from '../composables/useGlobalShortcuts'

const uiStore = useUiStore()

// Registers cleanup via onScopeDispose internally — no explicit teardown needed.
useGlobalShortcuts()
</script>

<template>
  <AppShell
    v-model:command-palette-open="uiStore.commandPaletteOpen"
    v-model:sidebar-collapsed="uiStore.sidebarCollapsed"
  >
    <RouterView />
  </AppShell>
</template>
