<script setup lang="ts">
/**
 * IdentitiesView — `/access/identities` list page (MVP: `type=user`).
 *
 * Reads the cursor-paginated user list from `useIdentitiesStore` and renders a
 * hand-rolled semantic table + client-side quick-filter (BR-005: no server
 * filter yet). Row actions (edit / lock / change-password …) and their `<Can>`
 * gating land with the operation modals (PR-10); this page is read-only.
 *
 * The "Service accounts" tab is a disabled placeholder (FR-030): MVP manages
 * only user identities; service-account / cell-as-principal support is Wave 2+.
 */
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useIdentitiesStore } from '../stores/useIdentitiesStore'
import IdentityStatusPill from '../components/IdentityStatusPill.vue'

const { t } = useI18n()
const store = useIdentitiesStore()
const { filteredUsers, loading, errorKey, hasMore, filter } = storeToRefs(store)

onMounted(() => {
  void store.fetchList()
})

/** Locale-aware timestamp (Intl, never a hand-rolled format string). */
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>

<template>
  <section class="identities">
    <header class="identities__header">
      <h1 class="identities__title">{{ t('access.identities.title') }}</h1>
      <p class="identities__subtitle">{{ t('access.identities.subtitle') }}</p>
    </header>

    <div class="identities__tabs" role="tablist" :aria-label="t('access.identities.tabs.label')">
      <button
        type="button"
        role="tab"
        class="identities__tab identities__tab--active"
        :aria-selected="true"
        tabindex="0"
      >
        {{ t('access.identities.tabs.users') }}
      </button>
      <button
        type="button"
        role="tab"
        class="identities__tab identities__tab--disabled"
        :aria-selected="false"
        aria-disabled="true"
        tabindex="-1"
        :title="t('access.identities.tabs.serviceAccountsHint')"
      >
        {{ t('access.identities.tabs.serviceAccounts') }}
      </button>
    </div>

    <div class="identities__toolbar">
      <label class="identities__filter-label" for="identities-filter">
        {{ t('access.identities.filter.label') }}
      </label>
      <input
        id="identities-filter"
        v-model="filter"
        class="identities__filter"
        type="search"
        autocomplete="off"
        :placeholder="t('access.identities.filter.placeholder')"
      />
    </div>

    <p v-if="errorKey" class="identities__error" role="alert">{{ t(errorKey) }}</p>

    <p v-else-if="loading && filteredUsers.length === 0" class="identities__loading" role="status">
      {{ t('access.identities.loading') }}
    </p>

    <p v-else-if="filteredUsers.length === 0" class="identities__empty">
      {{ t('access.identities.empty') }}
    </p>

    <template v-else>
      <table class="identities__table" :aria-label="t('access.identities.table.label')">
        <thead>
          <tr>
            <th scope="col">{{ t('access.identities.table.username') }}</th>
            <th scope="col">{{ t('access.identities.table.email') }}</th>
            <th scope="col">{{ t('access.identities.table.status') }}</th>
            <th scope="col">{{ t('access.identities.table.createdAt') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" class="identities__row">
            <td class="identities__cell identities__cell--name">{{ u.username }}</td>
            <td class="identities__cell">{{ u.email }}</td>
            <td class="identities__cell"><IdentityStatusPill :status="u.status" /></td>
            <td class="identities__cell">
              <time :datetime="u.createdAt">{{ formatDate(u.createdAt) }}</time>
            </td>
          </tr>
        </tbody>
      </table>

      <button
        v-if="hasMore"
        type="button"
        class="identities__more"
        data-action="load-more"
        :disabled="loading"
        @click="store.loadMore()"
      >
        {{ t('access.identities.loadMore') }}
      </button>
    </template>
  </section>
</template>

<style scoped>
.identities {
  max-width: 1080px;
  padding: 28px 32px;
}

.identities__header {
  margin-bottom: 20px;
}

.identities__title {
  margin: 0 0 4px;
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--fg);
}

.identities__subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--fg-muted);
}

.identities__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.identities__tab {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--fg-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.identities__tab--active {
  color: var(--fg);
  border-bottom-color: var(--accent);
}

.identities__tab--disabled {
  color: var(--fg-faint);
  cursor: not-allowed;
  opacity: var(--opacity-disabled);
}

.identities__tab:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--r-sm);
}

.identities__toolbar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  max-width: 320px;
}

.identities__filter-label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--fg);
}

.identities__filter {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--r);
  transition: border-color 0.15s;
}

.identities__filter::placeholder {
  color: var(--fg-faint);
}

.identities__filter:focus-visible {
  outline: none;
  border-color: var(--accent);
}

.identities__error {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--err);
}

.identities__loading,
.identities__empty {
  margin: 0;
  padding: 32px 0;
  font-size: 13px;
  color: var(--fg-muted);
}

.identities__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.identities__table thead th {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  color: var(--fg-muted);
  background: var(--bg-sunken);
  border-bottom: 1px solid var(--line);
}

.identities__row {
  border-bottom: 1px solid var(--line-soft);
}

.identities__cell {
  padding: 10px 12px;
  color: var(--fg);
  vertical-align: middle;
}

.identities__cell--name {
  font-weight: 500;
}

.identities__cell time {
  color: var(--fg-muted);
  font-variant-numeric: tabular-nums;
}

.identities__more {
  margin-top: 16px;
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--fg);
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--r);
}

.identities__more:hover:not(:disabled) {
  background: var(--bg-sunken);
}

.identities__more:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.identities__more:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .identities__filter {
    transition: none;
  }
}
</style>
