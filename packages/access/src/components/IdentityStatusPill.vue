<script setup lang="ts">
/**
 * IdentityStatusPill — status badge for a user identity.
 *
 * a11y (WCAG 1.4.1): state is conveyed by the text label, never by colour
 * alone; the colour dot is decorative (`aria-hidden`). Known states map to an
 * i18n label + token-backed colour; unknown backend states fall back to the raw
 * value in a neutral variant so the UI never hides information it can't classify.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ status: string }>()
const { t } = useI18n()

type Variant = 'ok' | 'warn' | 'neutral'
const VARIANT: Record<string, Variant> = { active: 'ok', locked: 'warn' }
const KNOWN = new Set(['active', 'locked'])

const variant = computed<Variant>(() => VARIANT[props.status] ?? 'neutral')
const label = computed(() =>
  KNOWN.has(props.status) ? t(`access.identities.status.${props.status}`) : props.status,
)
</script>

<template>
  <span class="pill" :class="`pill--${variant}`" :data-variant="variant">
    <span class="pill__dot" aria-hidden="true" />
    <span class="pill__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 9px;
  font-size: 12px;
  line-height: 18px;
  color: var(--fg-muted);
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
}

.pill__dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: var(--r-pill);
}

.pill--ok {
  color: var(--ok);
}

.pill--warn {
  color: var(--warn);
}

.pill--neutral {
  color: var(--fg-muted);
}
</style>
