// src/api.ts
import axios from "axios";

export type Tokens = {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const storage = {
  getTokens(): Tokens | null {
    const raw = localStorage.getItem("tokens");
    return raw ? JSON.parse(raw) : null;
  },
  setTokens(t: Tokens | null) {
    if (t) localStorage.setItem("tokens", JSON.stringify(t));
    else localStorage.removeItem("tokens");
  },
};

export const api = axios.create({
  baseURL: API_BASE,
});

// Attach Authorization header
api.interceptors.request.use((config) => {
  const t = storage.getTokens();
  if (t?.accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t.accessToken}`;
  }
  return config;
});

// Auto refresh on 401 one time
let refreshing = false;
let waiters: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err?.response?.status === 401 && !original._retry) {
      original._retry = true;

      const current = storage.getTokens();
      const refreshToken = current?.refreshToken;
      if (!refreshToken) {
        storage.setTokens(null);
        return Promise.reject(err);
      }

      if (refreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
      } else {
        refreshing = true;
        try {
          const { data } = await axios.post<Tokens>(`${API_BASE}/auth/refresh`, {
            refreshToken,
          });
          // keep the same refresh token unless API returns a new one
          storage.setTokens({ ...current!, ...data, refreshToken: current!.refreshToken });
        } catch (e) {
          storage.setTokens(null);
          refreshing = false;
          waiters = [];
          return Promise.reject(err);
        }
        refreshing = false;
        waiters.forEach((fn) => fn());
        waiters = [];
      }

      const updated = storage.getTokens();
      if (updated?.accessToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${updated.accessToken}`;
        return api(original);
      }
    }
    return Promise.reject(err);
  },
);

// High-level calls
export const AuthAPI = {
  signUp(email: string, password: string, username?: string) {
    return api.post("/auth/signup", { email, password, username });
  },
  confirm(username: string, code: string) {
    return api.post("/auth/confirm", { username, code });
  },
  resend(username: string) {
    return api.post("/auth/resend", { username });
  },
  async signIn(username: string, password: string) {
    const { data } = await api.post<Tokens>("/auth/signin", { username, password });
    storage.setTokens(data);
    return data;
  },
  async signOut() {
    try {
      await api.post("/auth/signout");
    } finally {
      storage.setTokens(null);
    }
  },
  forgot(username: string) {
    return api.post("/auth/forgot", { username });
  },
  reset(username: string, code: string, newPassword: string) {
    return api.post("/auth/reset", { username, code, newPassword });
  },
  changePassword(currentPassword: string, newPassword: string) {
    return api.post("/auth/change-password", { currentPassword, newPassword });
  },
  async getMe() {
    const { data } = await api.get("/users/me");
    return data;
  },
  getStoredTokens: storage.getTokens,
  setStoredTokens: storage.setTokens,
};
