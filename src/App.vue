<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AreaSelect from './components/AreaSelect.vue'
</script>

<template>
  <header>
    <nav>
      <!-- <RouterLink to="/">Home</RouterLink> -->
      <!-- <RouterLink to="/about">About</RouterLink> -->
      <RouterLink to="/graph/force">Force Directed Graph</RouterLink>
      <RouterLink to="/graph/hierarchy">Hierarchy Edge Bundling</RouterLink>
    </nav>

    <AreaSelect />
  </header>

  <div class="routerView">
    <RouterView />
  </div>
</template>

<style scoped>
nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
