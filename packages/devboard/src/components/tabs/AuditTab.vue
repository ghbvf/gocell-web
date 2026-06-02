<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import type { CellEntry } from '../../manifest/types'
import { fetchCellAudit } from '../../api/cellAudit'
import type { CellAuditEntry } from '../../api/cellAudit'

defineProps<{ cell: CellEntry }>()

const { t } = useI18n()

type LoadState = 'loading' | 'error' | 'empty' | 'data'

const state = ref<LoadState>('loading')
const entries = ref<CellAuditEntry[]>([])

onMounted(async () => {
  try {
    const res = await fetchCellAudit({ limit: 20 })
    entries.value = res.data
    state.value = res.data.length === 0 ? 'empty' : 'data'
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <section class="audit-tab">
    <p v-if="state === 'loading'" role="status" class="audit-tab__status">
      {{ t('cells.audit.loading') }}
    </p>

    <p
      v-else-if="state === 'error'"
      role="alert"
      class="audit-tab__status audit-tab__status--error"
    >
      {{ t('cells.audit.error') }}
    </p>

    <p v-else-if="state === 'empty'" class="audit-tab__status">
      {{ t('cells.audit.empty') }}
    </p>

    <template v-else>
      <div class="audit-tab__table-wrap">
        <table class="audit-tab__table">
          <thead>
            <tr>
              <th scope="col">{{ t('cells.audit.action') }}</th>
              <th scope="col">{{ t('cells.audit.actor') }}</th>
              <th scope="col">{{ t('cells.audit.time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td class="audit-tab__cell--mono">{{ entry.eventType }}</td>
              <td>{{ entry.actorId }}</td>
              <td class="audit-tab__cell--mono">{{ entry.timestamp }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <RouterLink to="/audit" class="audit-tab__open-full">
        {{ t('cells.audit.openFull') }}
      </RouterLink>
    </template>
  </section>
</template>

<style scoped>
.audit-tab {
  padding: 16px;
}

.audit-tab__status {
  margin: 0;
  font-size: 13px;
  color: var(--fg-muted);
}

.audit-tab__status--error {
  color: var(--err);
}

.audit-tab__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line-soft);
  border-radius: var(--r);
}

.audit-tab__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.audit-tab__table thead th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
  color: var(--fg-muted);
  border-bottom: 1px solid var(--line-soft);
  background: var(--bg-sunken);
  white-space: nowrap;
}

.audit-tab__table tbody td {
  padding: 8px 12px;
  color: var(--fg);
  border-bottom: 1px solid var(--line-soft);
  vertical-align: top;
}

.audit-tab__table tbody tr:last-child td {
  border-bottom: none;
}

.audit-tab__cell--mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.audit-tab__open-full {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
}

.audit-tab__open-full:hover {
  text-decoration: underline;
}
</style>
