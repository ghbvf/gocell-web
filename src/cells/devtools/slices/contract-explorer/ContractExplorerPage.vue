<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>Contract 全景浏览器</h2>
      <p style="color: #666;">浏览和搜索系统中所有的 Contract (HTTP/Event/Command/Projection) 及其在各 Slice 中的被引用情况。</p>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <a-segmented v-model:value="activeKind" :options="typeOptions" />
      <a-input-search
        v-model:value="searchQuery"
        placeholder="搜索 Contract ID 或 Owner Cell"
        style="width: 300px"
        allowClear
      />
    </div>

    <div v-if="filteredContracts.length === 0" style="padding: 40px 0; text-align: center;">
      <a-empty description="没有找到匹配的 Contract" />
    </div>
    
    <a-row v-else :gutter="[16, 16]">
      <a-col :xs="24" :sm="24" :md="12" :xl="8" v-for="c in filteredContracts" :key="c.id">
        <ContractCard :contract="c" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { parseDevtoolsData } from '../../shared/parser'
import type { ContractDetail } from './types'
import ContractCard from './ContractCard.vue'

const allContracts = ref<ContractDetail[]>([])
const activeKind = ref('all')
const searchQuery = ref('')

onMounted(() => {
  const data = parseDevtoolsData()
  allContracts.value = data.contractDetails
})

const typeOptions = computed(() => {
  const counts = { all: 0, http: 0, event: 0, command: 0, projection: 0 }
  counts.all = allContracts.value.length
  allContracts.value.forEach(c => {
    if (counts[c.kind as keyof typeof counts] !== undefined) {
      counts[c.kind as keyof typeof counts]++
    }
  })
  
  return [
    { label: `All (${counts.all})`, value: 'all' },
    { label: `HTTP (${counts.http})`, value: 'http' },
    { label: `Event (${counts.event})`, value: 'event' },
    { label: `Command (${counts.command})`, value: 'command' },
    { label: `Projection (${counts.projection})`, value: 'projection' },
  ]
})

const filteredContracts = computed(() => {
  return allContracts.value.filter(c => {
    // filter by kind
    if (activeKind.value !== 'all' && c.kind !== activeKind.value) {
      return false
    }
    // filter by search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!c.id.toLowerCase().includes(q) && !c.ownerCell.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  }).sort((a, b) => a.id.localeCompare(b.id))
})
</script>
