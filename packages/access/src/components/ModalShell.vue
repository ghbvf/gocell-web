<script setup lang="ts">
/**
 * ModalShell — accessible modal primitive (access-private; extract to @gocell/core
 * when a second cell needs it).
 *
 * Hand-rolled focus management (jsdom lacks HTMLDialogElement.showModal): on open
 * it records the opener, traps Tab within the panel, closes on Escape / backdrop
 * click, and restores focus to the opener on close. role/aria-modal/aria-labelledby
 * make it announce correctly; `alertdialog` is used for destructive confirmations.
 */
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    /** id of the element labelling the dialog (its title). */
    titleId: string
    role?: 'dialog' | 'alertdialog'
  }>(),
  { role: 'dialog' },
)

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE))
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
    return
  }
  if (e.key !== 'Tab') return
  const els = focusables()
  if (els.length === 0) {
    e.preventDefault()
    panel.value?.focus()
    return
  }
  const first = els[0] as HTMLElement
  const last = els[els.length - 1] as HTMLElement
  const active = document.activeElement
  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      opener = (document.activeElement as HTMLElement | null) ?? null
      document.addEventListener('keydown', onKeydown, true)
      void nextTick(() => {
        const els = focusables()
        ;(els[0] ?? panel.value)?.focus()
      })
    } else {
      document.removeEventListener('keydown', onKeydown, true)
      opener?.focus?.()
      opener = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown, true)
})
</script>

<template>
  <div v-if="open" class="modal__backdrop" @click.self="emit('close')">
    <div
      ref="panel"
      class="modal__panel"
      :role="role"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--overlay-bg);
}

.modal__panel {
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-lg);
}

.modal__panel:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
