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

// Attach auth header
api.interceptors.request.use((config) => {
  const t = tokenStore.load();
  if (t?.accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t.accessToken}`;
  }
  return config;
});

// 401 refresh-once
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
          queue.forEach((f) => f());
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

/* ───────────────── Auth ───────────────── */
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
  async signOut() {
    try {
      await api.post('/auth/signout');
    } finally {
      tokenStore.save(null);
    }
  },
};

/* ─────────────── Common ─────────────── */
export const CommonAPI = {
  async listCategories() {
    const { data } = await api.get('/categories');
    return data as { id: number; name: string; slug: string }[];
  },
};

/* ─────────────── Videos ─────────────── */
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

export type VideoQuizPublic = {
  quiz: null | {
    id: string;
    title: string;
    questions: { id: string; text: string; options: { id: string; text: string }[] }[];
  };
  section: null | { id: string; chapterId: string };
  sectionsCount?: number;
};

export type QuizAttemptResult = {
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
};

export const VideosAPI = {
  async get(id: string) {
    const { data } = await api.get(`/videos/${id}`);
    return data as any;
  },
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
  async presignUpload(fileName: string, contentType: string): Promise<PresignPost | PresignPut> {
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
    quiz: { text: string; options: { text: string; isCorrect?: boolean }[] }[];
  }) {
    const { data } = await api.post('/videos', payload);
    return data;
  },

  // likes
  async like(id: string) {
    const { data } = await api.post(`/videos/${id}/like`);
    return data as { ok: true };
  },
  async unlike(id: string) {
    const { data } = await api.delete(`/videos/${id}/like`);
    return data as { ok: true };
  },

  // comments
  async listComments(id: string, take = 20, skip = 0) {
    const { data } = await api.get(`/videos/${id}/comments`, { params: { take, skip } });
    return data as Array<{
      id: string;
      text: string;
      createdAt: string;
      author: { id: string; username: string; displayName: string; avatarUrl?: string | null };
    }>;
  },
  async addComment(id: string, text: string) {
    const { data } = await api.post(`/videos/${id}/comments`, { text });
    return data as { id: string };
  },

  // video quiz
  async getQuiz(id: string) {
    const { data } = await api.get(`/videos/${id}/quiz`);
    return data as VideoQuizPublic;
  },
  async submitQuiz(id: string, answers: { questionId: string; selectedOptionId: string }[]) {
    const { data } = await api.post(`/videos/${id}/quiz/attempt`, { answers });
    return data as QuizAttemptResult;
  },
};

/* ─────────────── Courses ─────────────── */
export const CoursesAPI = {
  // browse
  async browse(params: { q?: string; categoryId?: number; take?: number; skip?: number } = {}) {
    const { data } = await api.get('/courses', { params });
    return data as Array<{
      id: string;
      title: string;
      description?: string | null;
      coverImageUrl?: string | null;
      published: boolean;
      createdAt: string;
      author: { id: string; username: string; displayName: string; avatarUrl?: string | null };
      category: { id: number; name: string; slug: string };
      _count?: { enrollments?: number };
    }>;
  },

  // public course
  async getPublic(courseId: string) {
    const { data } = await api.get(`/courses/${courseId}`);
    return data as {
      id: string;
      title: string;
      description?: string | null;
      coverImageUrl?: string | null;
      published: boolean;
      createdAt: string;
      author: { id: string; username: string; displayName: string; avatarUrl?: string | null };
      category: { id: number; name: string; slug: string };
      chapters: Array<{
        id: string;
        title: string;
        order: number;
        sections: Array<{
          id: string;
          title: string;
          order: number;
          video: { id: string; title: string; description?: string | null; durationSec: number };
        }>;
      }>;
      quizzes: Array<{ id: string; title: string; courseId: string }>;
      _count?: { enrollments?: number };
    };
  },

  // enroll
  async enroll(courseId: string) {
    const { data } = await api.post('/courses/enroll', { courseId });
    return data as {
      id: string;
      userId: string;
      courseId: string;
      status: 'IN_PROGRESS' | 'COMPLETED';
      progressPct: number;
      startedAt?: string;
      completedAt?: string | null;
    };
  },

  // submit section quiz
  async submitSectionQuiz(sectionId: string, answers: { questionId: string; selectedOptionId: string }[]) {
    const { data } = await api.post('/courses/submit-section-quiz', { sectionId, answers });
    return data as {
      attemptId: string;
      score: number;
      maxScore: number;
      completedSection: boolean;
      progressPct: number;
    };
  },

  // authoring
  async listMine() {
    const { data } = await api.get('/courses', { params: { mine: 1 } });
    return data as any[];
  },
  async createCourse(payload: {
    title: string;
    categoryId: number;
    description?: string | null;
    coverImageUrl?: string | null;
    published?: boolean;
  }) {
    const { data } = await api.post('/courses', payload);
    return data as { id: string };
  },
  async updateCourse(id: string, payload: any) {
    const { data } = await api.patch(`/courses/${id}`, payload);
    return data;
  },
  async setPublished(id: string, published: boolean) {
    const { data } = await api.patch(`/courses/${id}/publish`, { published });
    return data;
  },
  async deleteCourse(id: string) {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  },
  async addChapter(courseId: string, dto: { title: string; order: number }) {
    const { data } = await api.post(`/courses/${courseId}/chapters`, dto);
    return data as { id: string };
  },
  async deleteChapter(chapterId: string) {
    const { data } = await api.delete(`/courses/chapters/${chapterId}`);
    return data;
  },
  async addSection(chapterId: string, dto: { title: string; order: number; videoId: string }) {
    const { data } = await api.post(`/courses/chapters/${chapterId}/sections`, dto);
    return data as { id: string };
  },
  async deleteSection(sectionId: string) {
    const { data } = await api.delete(`/courses/sections/${sectionId}`);
    return data;
  },

  // manual final exam endpoints
  async getFinal(courseId: string) {
    const { data } = await api.get(`/courses/${courseId}/final`);
    return data as {
      id: string;
      title: string;
      questions: { id: string; text: string; options: { id: string; text: string }[] }[];
    } | null;
  },
  async upsertFinal(courseId: string, payload: {
    title: string;
    questions: { text: string; options: { text: string; isCorrect: boolean }[] }[];
  }) {
    const { data } = await api.post(`/courses/${courseId}/final`, payload);
    return data as { id: string };
  },
  async submitFinal(courseId: string, answers: { questionId: string; selectedOptionId: string }[]) {
    const { data } = await api.post(`/courses/${courseId}/final/submit`, { answers });
    return data as { attemptId: string; score: number; maxScore: number; passed: boolean; progressPct: number };
  },

  // progress
  async getProgress(courseId: string) {
    const { data } = await api.get(`/courses/${courseId}/progress/me`);
    return data as {
      enrollment: null | {
        id: string;
        userId: string;
        courseId: string;
        status: 'IN_PROGRESS' | 'COMPLETED';
        progressPct: number;
        startedAt?: string;
        completedAt?: string | null;
      };
      sections: Array<{ sectionId: string; completedAt: string | null; score?: number | null; maxScore?: number | null }>;
      final?: { available: boolean; attempted?: boolean; passed?: boolean };
    };
  },

  // (optional legacy) random generator — keep if you still want the button elsewhere
  async generateFinal(courseId: string, opts?: { count?: number; shuffle?: boolean }) {
    const { data } = await api.post(`/courses/${courseId}/final/generate`, opts ?? {});
    return data as { finalQuizId: string; questions: number };
  },

  // enrollments list
  async listMyEnrollments() {
    const { data } = await api.get('/courses/enrollments/me');
    return data as Array<{
      id: string;
      userId: string;
      courseId: string;
      status: 'IN_PROGRESS' | 'COMPLETED';
      progressPct: number;
      startedAt?: string | null;
      completedAt?: string | null;
      course: { id: string; title: string; coverImageUrl?: string | null; category?: { id: number; name: string } | null };
    }>;
  },
};

/* ─────────────── Feed ─────────────── */
export type FeedItem = {
  id: string;
  title: string;
  description?: string | null;
  durationSec: number;
  category?: { id: number; name: string } | null;
  author?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
  likesCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
};

export const FeedAPI = {
  async next(categoryId?: number, exclude?: string) {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (exclude) params.exclude = exclude;
    const { data } = await api.get('/feed/next', { params });
    return data as FeedItem;
  },
};

/* ─────────────── S3 helper ─────────────── */
export async function postToS3(url: string, fields: Record<string, string>, file: File) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${text}`);
  }
  return { key: (fields as any).key };
}

/* ─────────────── Profile ─────────────── */
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
