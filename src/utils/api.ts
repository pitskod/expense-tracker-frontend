import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const rawEnvUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL =
  (rawEnvUrl ? rawEnvUrl.replace(/host\.docker\.internal/gi, 'localhost') : undefined) ||
  'http://localhost:8000';

type TokenResponse = { access_token: string; token_type: string };

let accessToken: string | null = null;
let refreshInFlight: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function logout(): Promise<void> {
  try {
    await rawClient.get('/api/auth/logout');
  } catch {
  } finally {
    clearAccessToken();
  }
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    return data?.detail || data?.message || err.message;
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const rawClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
  } else {
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

async function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = rawClient
      .post<TokenResponse>('/api/auth/token')
      .then((res) => {
        const newToken = res.data.access_token;
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function ensureAuth(): Promise<void> {
  if (accessToken) return;
  await refreshAccessToken();
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (!error.response) {
      throw new Error(`Unable to connect to the server. Please ensure the backend is running at ${API_URL}`);
    }

    if (originalRequest?.url?.includes('/api/auth/token')) {
      clearAccessToken();
      throw new Error(extractErrorMessage(error));
    }

    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      } catch (e) {
        clearAccessToken();
        throw new Error(extractErrorMessage(e));
      }
    }

    throw new Error(extractErrorMessage(error));
  }
);

