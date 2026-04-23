<template>
  <a-drawer
    :open="open"
    title="Node Meta Details"
    width="500"
    @close="handleClose"
  >
    <div v-if="node" class="node-meta">
      <h3>ID: {{ node.id }}</h3>
      <a-tag color="blue">Type: {{ node.data.type }}</a-tag>
      
      <h4 style="margin-top: 16px;">Raw Source:</h4>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
{{ node.data.rawYaml }}
      </pre>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">


defineProps<{ open: boolean, node: any }>()
const emit = defineEmits(['update:open'])

const handleClose = () => {
  emit('update:open', false)
}
</script>
