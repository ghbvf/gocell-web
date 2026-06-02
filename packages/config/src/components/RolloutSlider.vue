<script setup lang="ts">
/**
 * RolloutSlider — rollout percentage control (0–100).
 *
 * Uses a native <input type="range"> for built-in keyboard support (← → Home End).
 * Emits `update:modelValue` with clamped integer (0–100).
 * a11y: aria-valuenow/min/max, aria-label (caller must pass i18n-resolved string),
 * keyboard-operable via native range.
 * prefers-reduced-motion: transition disabled when reduced motion is preferred.
 */
withDefaults(
  defineProps<{
    modelValue: number
    /** Caller must pass a pre-translated aria-label string. */
    ariaLabel?: string
  }>(),
  { ariaLabel: 'Rollout percentage' },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)))
}

function onChange(event: Event): void {
  const raw = Number((event.target as HTMLInputElement).value)
  emit('update:modelValue', clamp(raw))
}
</script>

<template>
  <div class="rollout-slider">
    <div class="rollout-slider__track">
      <input
        id="rollout-slider-input"
        type="range"
        class="rollout-slider__input"
        :value="modelValue"
        min="0"
        max="100"
        step="1"
        :aria-valuenow="modelValue"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="ariaLabel"
        @input="onChange"
      />
    </div>
    <output class="rollout-slider__value" :for="'rollout-slider-input'"> {{ modelValue }}% </output>
  </div>
</template>

<style scoped>
.rollout-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rollout-slider__track {
  flex: 1;
}

.rollout-slider__input {
  width: 100%;
  height: 4px;
  accent-color: var(--accent);
  cursor: pointer;
}

.rollout-slider__input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: var(--r-sm);
}

.rollout-slider__value {
  min-width: 38px;
  font-size: 12.5px;
  font-family: var(--font-mono);
  color: var(--fg-muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .rollout-slider__input {
    transition: none;
  }
}
</style>
