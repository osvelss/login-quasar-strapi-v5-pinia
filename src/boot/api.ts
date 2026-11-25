import { defineBoot } from "#q-app";
import { useAuthStore } from "@/stores/auth-store";
import { api, setTokenAccessors } from "@/composables/api";

export default defineBoot(({ app }) => {
  setTokenAccessors({
    getToken: () => useAuthStore().token,
    setToken: (token) => {
      useAuthStore().token = token;
    },
  });

  app.config.globalProperties.$api = api;
});
