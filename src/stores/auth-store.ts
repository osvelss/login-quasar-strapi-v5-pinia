import { api } from "@/composables/api";
import type { Auth, User } from "@/types/auth";
import { acceptHMRUpdate, defineStore } from "pinia";
import { LocalStorage } from "quasar";

interface LoginPayload {
  identifier: string;
  password: string;
}

/**
 * La cookie de refresco es HttpOnly, así que el cliente no puede saber si
 * existe. Guardamos una marca local para no pedir un refresco cuando el
 * usuario nunca inició sesión (el backend responde 400 en ese caso).
 */
const SESSION_HINT_KEY = "app:has-session";

function readSessionHint(): boolean {
  try {
    return LocalStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionHint(active: boolean): void {
  try {
    if (active) {
      LocalStorage.set(SESSION_HINT_KEY, "1");
    } else {
      LocalStorage.remove(SESSION_HINT_KEY);
    }
  } catch {
    // LocalStorage no disponible (modo privado, SSR, etc.): se ignora.
  }
}

interface HttpErrorLike {
  response?: { status?: number };
}

/**
 * Solo una respuesta explícita del servidor invalida la sesión.
 * Un error de red o un 5xx es temporal: la cookie de refresco puede seguir
 * siendo válida aunque el backend esté caído en ese momento.
 */
function isSessionRejected(error: unknown): boolean {
  const status = (error as HttpErrorLike | null)?.response?.status;
  return status === 400 || status === 401 || status === 403;
}

/** Evita refrescos duplicados ante navegaciones concurrentes. */
let initPromise: Promise<void> | null = null;
/** Evita martillear el backend mientras esté caído. */
let lastInitAttempt = 0;
const RETRY_DELAY_MS = 5_000;

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
        writeSessionHint(true);

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
      } catch {
        // El cierre de sesión local se completa aunque falle el backend
        // (p. ej. si la sesión ya expiró), para no dejar una promesa sin manejar.
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

      // Si otra navegación ya está inicializando, esperamos a esa misma
      // promesa en vez de lanzar un segundo /auth/refresh.
      if (initPromise) return initPromise;

      // Cooldown: si el backend está caído, no reintentamos en cada click.
      if (Date.now() - lastInitAttempt < RETRY_DELAY_MS) return;

      lastInitAttempt = Date.now();
      initPromise = (async () => {
        this.loading = true;

        try {
          // Sin marca de sesión no hay cookie que refrescar: evitamos la
          // petición para que el backend no devuelva un 400 al abrir la app
          // sin haber iniciado sesión.
          if (!readSessionHint()) {
            this.clearSession();
            this.initialized = true;
            return;
          }

          // Recuperar la sesión mediante la cookie HttpOnly
          await this.refreshToken();

          // Recuperar los datos del usuario
          await this.fetchUser();
          this.initialized = true;
        } catch (error) {
          if (isSessionRejected(error)) {
            // El servidor dice que la sesión ya no sirve: sí borramos la marca.
            this.clearSession();
            this.initialized = true;
          }
          // Error de red / 5xx: conservamos la marca y dejamos initialized
          // en false para reintentar cuando vuelva la conexión.
        } finally {
          this.loading = false;
        }
      })();

      try {
        await initPromise;
      } finally {
        initPromise = null;
      }
    },

    clearSession() {
      this.token = null;
      this.user = null;
      writeSessionHint(false);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
