import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/graph/force",
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
    {
      path: "/graph/force",
      name: "directedForceGraph",
      component: () => import("../views/ForceDirectedGraphView.vue"),
    },
    {
      path: "/graph/hierarchy",
      name: "hierarchyEdgeBundling",
      component: () => import("../views/HierarchyGraphView.vue"),
    },
  ],
});

export default router;
