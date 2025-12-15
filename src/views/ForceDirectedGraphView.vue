<template>
  <main>
    <ForceDirectedGraphLayers v-if="state.areas.length > 0" />
    <ForceDirectedGraphAreas v-else />
  </main>
</template>

<script setup lang="ts">
import { state } from '@/state'

import ForceDirectedGraphLayers from '@/components/graph/ForceDirectedGraphLayers.vue'
import ForceDirectedGraphAreas from '@/components/graph/ForceDirectedGraphAreas.vue'
</script>
