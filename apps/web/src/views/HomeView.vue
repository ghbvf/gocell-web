<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="home">
    <h1 class="v1-h1">{{ t('shell.brand') }}</h1>
    <p class="v1-sub">{{ t('command.hint') }}</p>
  </div>
</template>

<style scoped>
.home {
  padding: 40px;
}
</style>
