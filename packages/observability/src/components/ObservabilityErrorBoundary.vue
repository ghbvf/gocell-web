<script setup lang="ts">
import { ref, onErrorCaptured, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { UnavailablePanel } from '@gocell/core'

const { t } = useI18n()

const failed = ref(false)
const retryKey = ref(0)

onErrorCaptured(() => {
  failed.value = true
  return false
})

function retry(): void {
  failed.value = false
  retryKey.value += 1
}

// Render the alert as a VNode outside of the compiled block tree to avoid
// static-child patching crashes (Vue block optimization) when transitioning
// between the slot and the error state — the mocked UnavailablePanel shape
// differs from its production shape and breaks patchBlockChildren.
function renderAlert() {
  return h('div', { role: 'alert', class: 'obs-boundary' }, [
    h(UnavailablePanel, {
      title: t('observe.boundary.title'),
      message: t('observe.boundary.message'),
    }),
    h(
      'button',
      { type: 'button', class: 'obs-boundary__retry', onClick: retry },
      t('observe.boundary.retry'),
    ),
  ])
}
</script>

<template>
  <div class="obs-boundary-root">
    <component :is="renderAlert" v-if="failed" />
    <div v-else :key="retryKey" class="obs-boundary__slot">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.obs-boundary {
  padding: 16px;
}

.obs-boundary__retry {
  margin-top: 12px;
  height: 32px;
  padding: 0 14px;
  font-size: var(--text-base);
  color: var(--fg);
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--r);
  cursor: pointer;
}

.obs-boundary__retry:hover {
  background: var(--bg-sunken);
}

.obs-boundary__retry:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
