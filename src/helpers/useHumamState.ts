import { reactive } from "vue";

const state = reactive({
  areas: [],
  nodes: [],
  links: [],
  loading: true
});

export const useHumamState = () => ({
  state,
});
