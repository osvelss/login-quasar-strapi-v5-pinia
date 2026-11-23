import { ofetch } from "ofetch";

let getToken = () => null as string | null;

export const setTokenGetter = (getter: () => string | null) => {
  getToken = getter;
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
        getToken = () => token;
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
