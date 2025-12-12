<template>
  <main>
    <ForceDirectedGraphLayers v-if="state.areas.length > 0" v-bind="state" />
    <ForceDirectedGraphAreas v-else v-bind="state" />
  </main>
</template>

<script setup lang="ts">
import { useHumamState } from "@/helpers/useHumamState";

import ForceDirectedGraphLayers from "@/components/graph/ForceDirectedGraphLayers.vue";
import ForceDirectedGraphAreas from "@/components/graph/ForceDirectedGraphAreas.vue";

const { state } = useHumamState();
</script>
