import { api } from "@/composables/api";
import type { Auth, User } from "@/types/auth";
import { acceptHMRUpdate, defineStore } from "pinia";

interface LoginPayload {
  identifier: string;
  password: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
    initialized: false,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },

  actions: {
    async login(payload: LoginPayload) {
      this.loading = true;

      try {
        const res = await api<Auth>("/auth/local", {
          method: "POST",
          body: payload,
        });

        this.token = res.jwt;
        this.user = res.user;
        this.initialized = true;

        return res;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await api("/auth/logout", {
          method: "POST",
        });
      } finally {
        this.clearSession();
      }
    },

    async fetchUser() {
      const res = await api<User>("/users/me", {
        method: "GET",
      });

      this.user = res;
      return res;
    },

    async refreshToken() {
      const res = await api<{ jwt: string }>("/auth/refresh", {
        method: "POST",
      });

      this.token = res.jwt;
      return res;
    },

    async init() {
      if (this.initialized) return;

      this.loading = true;

      try {
        // Recuperar la sesión mediante la cookie HttpOnly
        await this.refreshToken();

        // Recuperar los datos del usuario
        await this.fetchUser();
      } catch {
        this.clearSession();
      } finally {
        this.initialized = true;
        this.loading = false;
      }
    },

    clearSession() {
      this.token = null;
      this.user = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
