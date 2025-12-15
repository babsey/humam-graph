<template>
  <v-select
    v-model="state.areas"
    :closeOnSelect="false"
    :options="areas"
    :selectable="() => state.areas.length < 5"
    multiple
    clearable
    placeholder="Choose up to 5 areas!"
    @update:modelValue="update"
  >
    <template #selected-option="option">
      <span :style="{ color: color(areaId(option.label)) }"
        >{{ option.label }} [{{ abbreviation(option.label) }}]</span
      >
    </template>

    <template #option="option">
      <span :style="{ color: color(areaId(option.label)) }"
        >{{ option.label }} [{{ abbreviation(option.label) }}]</span
      >
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { color } from '@/helpers/theme'
import { abbreviation, areas, areaId } from '@/helpers/parcellation'

import { state, update } from '@/state'

update()
</script>

<style>
:root {
  --vs-controls-color: var(--color-text);
  --vs-border-color: var(--color-border);

  --vs-state-disabled-bg: var(--color-background-mute);
  --vs-state-disabled-color: var(--color-text-mute);

  --vs-dropdown-bg: var(--color-background);
  --vs-dropdown-color: var(--color-text);
  --vs-dropdown-option-color: var(--color-text);

  --vs-selected-bg: var(--color-background);
  --vs-selected-color: var(--color-text);

  --vs-search-input-color: var(--color-text);

  --vs-dropdown-option--active-bg: var(--color-background-mute);
  --vs-dropdown-option--active-color: var(--color-text-mute);
}
</style>
