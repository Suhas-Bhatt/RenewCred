import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send the httpOnly refresh cookie
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  try {
    const token = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("accessToken="));

    if (token) {
      const value = decodeURIComponent(token.split("=")[1]);
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${value}`;
    }
  } catch {
    // Ignore cookie access issues during SSR
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
    return res.data?.data?.accessToken as string | null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const isAuthRoute = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshPromise = refreshPromise || refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;
      if (token) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
}
