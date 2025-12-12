<template>
  <v-select
    v-model="state.areas"
    :closeOnSelect="false"
    :options="areas"
    :selectable="() => state.areas.length < 5"
    multiple
    clearable
    placeholder="Choose up to 5 areas!"
    @update:modelValue="update">
    <template #selected-option="option">
      <span :style="{ color: color(id(option.label)) }">{{ option.label }} [{{ abbreviation(option.label) }}]</span>
    </template>

    <template #option="option">
      <span :style="{ color: color(id(option.label)) }">{{ option.label }} [{{ abbreviation(option.label) }}]</span>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { useHumamState } from "@/helpers/useHumamState";

import raw_data_areas from "@/assets/humam/humam_network_areas.json";
import raw_data from "@/assets/humam/humam_network_pop.json";

import { color } from "@/helpers/theme";

import { areas, nameMapping, abbreviation, id } from "@/helpers/parcellation";

const { state } = useHumamState();

const update = () => {
  state.links =
    state.areas.length > 0
      ? raw_data.links.filter(
          (link) =>
            state.areas.includes(nameMapping(link.source).area) && state.areas.includes(nameMapping(link.target).area)
        )
      : raw_data_areas.links;
  state.nodes =
    state.areas.length > 0
      ? raw_data.nodes.filter((node) => state.areas.includes(nameMapping(node.name).area))
      : raw_data_areas.nodes;
};

update();
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
