import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('notiflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Normalize MongoDB _id → id recursively ────────────────────────────────────
const normalizeIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) result[k] = normalizeIds(v);
    if (result._id !== undefined && result.id === undefined) result.id = result._id;
    return result;
  }
  return value;
};

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    response.data = normalizeIds(response.data);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`[API Error] ${status ?? 'Network'} — ${url ?? 'unknown'}`, {
      data: error.response?.data,
      message: error.message,
    });

    // /auth/ — expected failures (wrong password, etc.), never log out
    // /meta/dms — 401/403 means "Meta account not connected to Notiflow",
    //             not an expired Notiflow JWT, so don't log the user out
    const isAuthEndpoint    = url?.startsWith('/auth/');
    const isMetaDmsEndpoint = url?.startsWith('/meta/dms');
    if (status === 401 && !isAuthEndpoint && !isMetaDmsEndpoint) {
      localStorage.removeItem('notiflow_token');
      globalThis.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
