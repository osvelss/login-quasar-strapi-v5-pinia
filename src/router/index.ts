import { defineRouter } from "#q-app";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

import routes from "./routes";
import { useAuthStore } from "@/stores/auth-store";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(({ store } /* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to) => {
    const authStore = useAuthStore(store);

    if (!authStore.initialized) {
      await authStore.init();
    }
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: "login" };
    } else if (to.meta.isGuest && authStore.isAuthenticated) {
      return { name: "dashboard" };
    } else {
      return true;
    }
  });

  return Router;
});
