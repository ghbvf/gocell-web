<script setup lang="ts">
/**
 * RoleAssignmentForm — assign a role to / revoke a role from the current user.
 *
 * Props:
 *   roles  — the user's CURRENTLY-HELD roles (used to populate the revoke select)
 *   busy   — disables all controls while a mutation is in flight
 *
 * Emits:
 *   assign(roleId: string) — operator typed/pasted a roleId and confirmed
 *   revoke(roleId: string) — operator selected a held role and confirmed
 *
 * Gating:
 *   Assign button is wrapped in <Can action="assign" resource="role">.
 *   Revoke button is wrapped in <Can action="revoke" resource="role">.
 *   Default mode is 'hide' → fail-closed; buttons are absent when PDP denies.
 *
 * No Pinia / API imports — purely presentational.
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Can } from '@gocell/core'
import type { HttpAuthRoleListV1Response } from '@gocell/contracts'

type Role = HttpAuthRoleListV1Response['data'][number]

const props = withDefaults(
  defineProps<{
    roles: Role[]
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const emit = defineEmits<{
  assign: [roleId: string]
  revoke: [roleId: string]
}>()

const { t } = useI18n()

// ─── Assign section ───────────────────────────────────────────────────────────
const assignInput = ref('')

function onAssign(): void {
  const trimmed = assignInput.value.trim()
  if (!trimmed) return
  emit('assign', trimmed)
  assignInput.value = ''
}

// ─── Revoke section ───────────────────────────────────────────────────────────
/** Default to first role id or empty — managed as a plain ref */
const revokeSelected = ref('')

const revokeDisabled = computed(() => props.busy || props.roles.length === 0)

function onRevoke(): void {
  if (!revokeSelected.value) return
  emit('revoke', revokeSelected.value)
}
</script>

<template>
  <div class="raf">
    <!-- ─── Assign section ─────────────────────────────────────────────────── -->
    <section class="raf__section">
      <form class="raf__form" data-testid="assign-form" novalidate @submit.prevent="onAssign">
        <div class="raf__field">
          <label class="raf__label" for="raf-assign-input">
            {{ t('access.policies.assign.label') }}
          </label>
          <div class="raf__row">
            <input
              id="raf-assign-input"
              v-model="assignInput"
              class="raf__input"
              type="text"
              autocomplete="off"
              data-testid="assign-input"
              :disabled="busy"
              :placeholder="t('access.policies.assign.placeholder')"
            />
            <Can action="assign" resource="role">
              <button
                type="submit"
                class="raf__btn raf__btn--primary"
                data-testid="assign-btn"
                :disabled="busy"
                @click.prevent="onAssign"
              >
                {{ t('access.policies.assign.button') }}
              </button>
            </Can>
          </div>
        </div>
      </form>
    </section>

    <!-- ─── Revoke section ─────────────────────────────────────────────────── -->
    <section class="raf__section">
      <div class="raf__field">
        <label class="raf__label" for="raf-revoke-select">
          {{ t('access.policies.revoke.label') }}
        </label>
        <div class="raf__row">
          <select
            id="raf-revoke-select"
            v-model="revokeSelected"
            class="raf__select"
            data-testid="revoke-select"
            :disabled="revokeDisabled"
          >
            <option value="" disabled>
              {{ t('access.policies.revoke.selectPlaceholder') }}
            </option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <Can action="revoke" resource="role">
            <button
              type="button"
              class="raf__btn raf__btn--danger"
              data-testid="revoke-btn"
              :disabled="busy || roles.length === 0"
              @click="onRevoke"
            >
              {{ t('access.policies.revoke.button') }}
            </button>
          </Can>
        </div>
        <p v-if="roles.length === 0" class="raf__hint" data-testid="revoke-empty-hint">
          {{ t('access.policies.revoke.empty') }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.raf {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.raf__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.raf__form {
  display: contents;
}

.raf__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.raf__label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--fg);
}

.raf__row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.raf__input {
  flex: 1;
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--r);
  transition: border-color 0.15s;
}

.raf__input::placeholder {
  color: var(--fg-faint);
}

.raf__input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}

.raf__input:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.raf__select {
  flex: 1;
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--r);
  cursor: pointer;
  transition: border-color 0.15s;
}

.raf__select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}

.raf__select:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.raf__btn {
  flex-shrink: 0;
  height: 34px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: var(--r);
  cursor: pointer;
  transition: background-color 0.15s;
}

.raf__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.raf__btn:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.raf__btn--primary {
  color: var(--bg);
  background: var(--fg);
  border: 1px solid var(--fg);
}

.raf__btn--primary:hover:not(:disabled) {
  background: var(--fg-hover);
}

.raf__btn--danger {
  color: var(--err-strong);
  background: var(--bg-raised);
  border: 1px solid var(--line);
}

.raf__btn--danger:hover:not(:disabled) {
  background: var(--bg-sunken);
}

.raf__hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--fg-muted);
}

@media (prefers-reduced-motion: reduce) {
  .raf__input,
  .raf__select,
  .raf__btn {
    transition: none;
  }
}
</style>
