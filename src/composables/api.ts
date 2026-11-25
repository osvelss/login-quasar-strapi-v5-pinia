import { ofetch } from "ofetch";

let getToken = () => null as string | null;
let setToken: (token: string | null) => void = () => {};

interface TokenAccessors {
  getToken: () => string | null;
  setToken: (token: string | null) => void;
}

/**
 * Registra cómo leer y actualizar el token. Actualizar el token (en lugar de
 * reemplazar el getter) mantiene sincronizado el store después de un refresco
 * automático y al cerrar sesión.
 */
export const setTokenAccessors = ({
  getToken: get,
  setToken: set,
}: TokenAccessors) => {
  getToken = get;
  setToken = set;
};

const baseURL = `${import.meta.env.QCLI_VITE_APP_BASE_URL}/api`;
let refreshPromise: Promise<string | null> | null = null;

const renewToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const data = await ofetch<Record<string, any>>(
        `${baseURL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const token = data?.jwt;

      if (typeof token === "string" && token) {
        setToken(token);
        return token;
      }

      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const baseApi = ofetch.create({
  baseURL,
  credentials: "include",

  onRequest({ request, options }) {
    const headers = new Headers(options.headers);
    const token = getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    options.headers = headers;

    if (import.meta.env.DEV) {
      console.log("API Request:", request);
    }
  },
});

export const api = (async (request: any, options: any = {}) => {
  try {
    return await baseApi(request, options);
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;

    const token = await renewToken();
    if (!token) throw error;

    return baseApi(request, options);
  }
}) as typeof baseApi;
