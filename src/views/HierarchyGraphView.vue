<template>
  <main>
    <HierarchyEdgeBundling v-bind="state" />
  </main>
</template>

<script setup lang="ts">
import { useHumamState } from "@/helpers/useHumamState";

import HierarchyEdgeBundling from "@/components/graph/HierarchyEdgeBundling.vue";

const { state } = useHumamState();
</script>
