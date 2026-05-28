<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
 * Sidebar collapsed state and command palette open state are managed internally.
 * Both can be controlled externally via v-model:sidebarCollapsed and
 * v-model:commandPaletteOpen — when the external model is provided (non-undefined),
 * the internal state follows it and changes are emitted back (controlled mode).
 *
 * When the command palette is open, Sidebar and shell__main receive `inert`
 * to prevent AT/keyboard from reaching content behind the dialog (ARIA APG).
 */

const props = defineProps<{
  /** External control for command palette open state (v-model:commandPaletteOpen). */
  commandPaletteOpen?: boolean
  /** External control for sidebar collapsed state (v-model:sidebarCollapsed). */
  sidebarCollapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:commandPaletteOpen', value: boolean): void
  (e: 'update:sidebarCollapsed', value: boolean): void
}>()

// Internal state — authoritative when no external prop is supplied
const sidebarCollapsed = ref(false)
const commandPaletteOpen = ref(false)

// When external prop changes, sync internal state (controlled mode)
watch(
  () => props.sidebarCollapsed,
  (v) => {
    if (v !== undefined) sidebarCollapsed.value = v
  },
  { immediate: true },
)

watch(
  () => props.commandPaletteOpen,
  (v) => {
    if (v !== undefined) commandPaletteOpen.value = v
  },
  { immediate: true },
)

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
  emit('update:commandPaletteOpen', true)
}

function setCommandPaletteOpen(value: boolean): void {
  commandPaletteOpen.value = value
  emit('update:commandPaletteOpen', value)
}

function setSidebarCollapsed(value: boolean): void {
  sidebarCollapsed.value = value
  emit('update:sidebarCollapsed', value)
}
</script>

<template>
  <div class="shell">
    <Sidebar
      :collapsed="sidebarCollapsed"
      :inert="backgroundInert"
      @update:collapsed="setSidebarCollapsed($event)"
      @open-command-palette="openCommandPalette"
    />

    <div class="shell__main" :inert="backgroundInert">
      <TopBar @open-command-palette="openCommandPalette" />

      <main class="shell__content">
        <slot />
      </main>

      <AIBottomBar />
    </div>

    <CommandPalette :open="commandPaletteOpen" @update:open="setCommandPaletteOpen" />
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
