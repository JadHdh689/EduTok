// FILE: src/services/api.ts
import axios, { type AxiosRequestConfig } from 'axios';

export type Tokens = {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const storageKey = 'authTokens';
export const tokenStore = {
  load(): Tokens | null {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  },
  save(t: Tokens | null) {
    if (t) localStorage.setItem(storageKey, JSON.stringify(t));
    else localStorage.removeItem(storageKey);
  },
};

export const api = axios.create({ baseURL: API_BASE });

export const UploadsAPI = {
  async signGetByKey(key: string, expiresSec?: number) {
    const { data } = await api.get('/uploads/sign-get', { params: { key, expires: expiresSec } });
    return data as { url: string; key: string; bucket: string; expiresIn: number };
  },
};
// ─────────────────────────────────────────────────────────────────────────────
// Auth header
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const t = tokenStore.load();
  if (t?.accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t.accessToken}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
/** 401 → try refresh once */
// ─────────────────────────────────────────────────────────────────────────────
let refreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config || {};
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;

      const t = tokenStore.load();
      if (!t?.refreshToken) {
        tokenStore.save(null);
        return Promise.reject(error);
      }

      if (refreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
      } else {
        refreshing = true;
        try {
          const { data } = await axios.post<Tokens>(`${API_BASE}/auth/refresh`, {
            refreshToken: t.refreshToken,
          });
          tokenStore.save({ ...t, ...data, refreshToken: t.refreshToken });
        } catch (e) {
          tokenStore.save(null);
          refreshing = false;
          queue = [];
          return Promise.reject(error);
        }
        refreshing = false;
        queue.forEach((f) => f());
        queue = [];
      }

      const updated = tokenStore.load();
      if (updated?.accessToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${updated.accessToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

const normEmail = (v: string) => v.trim().toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  async signIn(username: string, password: string) {
    const { data } = await api.post<Tokens>('/auth/signin', {
      username: normEmail(username),
      password,
    });
    tokenStore.save(data);
    return data;
  },
  signUp(email: string, password: string, username?: string) {
    return api.post('/auth/signup', {
      email: normEmail(email),
      password,
      username: username && username.trim() ? username.trim() : undefined,
    });
  },
  confirm(username: string, code: string) {
    return api.post('/auth/confirm', {
      username: normEmail(username),
      code: code.trim(),
    });
  },
  resend(username: string) {
    return api.post('/auth/resend', { username: normEmail(username) });
  },
  forgot(username: string) {
    return api.post('/auth/forgot', { username: normEmail(username) });
  },
  reset(username: string, code: string, newPassword: string) {
    return api.post('/auth/reset', {
      username: normEmail(username),
      code: code.trim(),
      newPassword,
    });
  },
  signOut() {
    return api.post('/auth/signout');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────────────────────────────────────
export const CommonAPI = {
  async listCategories() {
    const { data } = await api.get('/categories');
    return data as { id: number; name: string; slug: string }[];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Videos
// ─────────────────────────────────────────────────────────────────────────────
export type PresignPost = {
  method?: 'POST';
  url: string;
  fields: Record<string, string>;
  key?: string;
};

export type PresignPut = {
  method: 'PUT';
  url: string;
  key: string;
  headers?: Record<string, string>;
};

export const VideosAPI = {
   async get(id: string) {
    const { data } = await api.get(`/videos/${id}`);
    return data as any;
  },
  // in services/api.ts inside VideosAPI:
async delete(id: string) {
  const { data } = await api.delete(`/videos/${id}`);
  return data;
},

  async streamUrl(id: string) {
    const { data } = await api.get(`/videos/${id}/stream`);
    return data as { url: string };
  },
  async listMine() {
    const { data } = await api.get('/videos', { params: { mine: 1 } });
    return data as any[];
  },

  async presignUpload(
    fileName: string,
    contentType: string
  ): Promise<PresignPost | PresignPut> {
    const { data } = await api.post('/uploads/presign', {
      fileName,
      contentType,
      kind: 'video',
    });
    return data as PresignPost | PresignPut;
  },

  async create(payload: {
    title: string;
    categoryId: number;
    description?: string;
    s3Key: string;
    durationSec: number;
    quiz: { text: string; options: { text: string; isCorrect?: boolean }[] }[]; // <-- isCorrect
  }) {
    const { data } = await api.post('/videos', payload);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────────────────────────────────────
export const CoursesAPI = {
  async listMine() {
    const { data } = await api.get('/courses', { params: { mine: 1 } });
    return data as any[];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Optional POST-only helper
// ─────────────────────────────────────────────────────────────────────────────
export async function postToS3(url: string, fields: Record<string, string>, file: File) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${text}`);
  }
  return { key: fields.key };
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile/me
// ─────────────────────────────────────────────────────────────────────────────
export const ProfileAPI = {
  async me() {
    const { data } = await api.get('/users/me');
    return data as {
      id: string;
      authSub: string;
      username: string;
      displayName: string;
      email?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      role: 'USER' | 'ADMIN';
      createdAt: string;
      updatedAt: string;
    };
  },
  async update(payload: { displayName?: string; bio?: string; avatarUrl?: string }) {
    const { data } = await api.patch('/users', payload);
    return data;
  },
};
