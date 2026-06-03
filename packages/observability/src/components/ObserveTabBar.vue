<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRovingTablist } from '@gocell/core'

const props = defineProps<{
  activeId: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const { t } = useI18n()

const ENABLED = ['overview', 'logs', 'traces'] as const
const WAVE2 = ['anomalies', 'whatChanged', 'serviceGraph', 'sliceHealth'] as const

type EnabledId = (typeof ENABLED)[number]

const tabBtnId = (id: string) => `observe-tab-${id}`
const panelId = (id: string) => `observe-panel-${id}`

const { onKeydown } = useRovingTablist<EnabledId>({
  tabIds: () => ENABLED,
  idFor: tabBtnId,
  onActivate: (id) => emit('select', id),
})
</script>

<template>
  <div role="tablist" :aria-label="t('observe.tablistLabel')" class="obs-tab-bar">
    <button
      v-for="id in ENABLED"
      :id="tabBtnId(id)"
      :key="id"
      type="button"
      role="tab"
      :aria-selected="id === props.activeId"
      :aria-controls="id === props.activeId ? panelId(id) : undefined"
      :tabindex="id === props.activeId ? 0 : -1"
      class="obs-tab-bar__btn"
      :class="{ 'obs-tab-bar__btn--active': id === props.activeId }"
      @click="emit('select', id)"
      @keydown="onKeydown($event, id)"
    >
      {{ t('observe.tabs.' + id) }}
    </button>

    <span
      v-for="id in WAVE2"
      :id="tabBtnId(id)"
      :key="id"
      role="tab"
      aria-selected="false"
      aria-disabled="true"
      tabindex="-1"
      class="obs-tab-bar__wave2"
    >
      {{ t('observe.tabs.' + id) }}
      <span class="obs-tab-bar__wave2-badge">{{ t('observe.waveTwo') }}</span>
    </span>
  </div>
</template>

<style scoped>
.obs-tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--line-soft);
}

.obs-tab-bar__btn {
  padding: 8px 14px;
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--fg-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  cursor: pointer;
  outline: none;
  transition:
    color 0.12s,
    border-color 0.12s;
  line-height: 1.4;
}

.obs-tab-bar__btn:hover {
  color: var(--fg);
}

.obs-tab-bar__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.obs-tab-bar__btn--active {
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
  font-weight: 500;
}

.obs-tab-bar__wave2 {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--fg-muted);
  border-bottom: 2px solid transparent;
  opacity: var(--opacity-disabled);
  cursor: default;
  user-select: none;
}

.obs-tab-bar__wave2-badge {
  display: inline-block;
  padding: 1px 6px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--fg-faint);
  background: var(--bg-sunken);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-pill);
}

@media (prefers-reduced-motion: reduce) {
  .obs-tab-bar__btn {
    transition: none;
  }
}
</style>
