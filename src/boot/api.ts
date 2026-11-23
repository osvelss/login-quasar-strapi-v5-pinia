import { defineBoot } from "#q-app";
import { api, setTokenGetter } from "@/composables/api";
import { useAuthStore } from "@/stores/auth-store";

export default defineBoot(({ app }) => {
  setTokenGetter(() => useAuthStore().token);

  app.config.globalProperties.$api = api;
  app.provide("api", api);
});
