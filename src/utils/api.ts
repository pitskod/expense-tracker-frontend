import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API configuration
// Always prefer localhost for the browser runtime.
// If something sets VITE_API_URL to host.docker.internal (Docker-only), rewrite it to localhost.
const rawEnvUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL =
  (rawEnvUrl ? rawEnvUrl.replace(/host\.docker\.internal/gi, 'localhost') : undefined) ||
  'http://localhost:8000';

type TokenResponse = { access_token: string; token_type: string };

// Access token is stored ONLY in this module closure (no localStorage/sessionStorage).
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

/**
 * Logs out the current device session.
 * - Calls backend `/api/auth/logout` to invalidate refresh token and clear cookie
 * - Always clears in-memory access token (even if backend call fails)
 */
export async function logout(): Promise<void> {
  try {
    await rawClient.get('/api/auth/logout');
  } catch {
    // Intentionally swallow: user intent is to sign out locally even if server/cookie is already gone.
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
  withCredentials: true, // send/receive refresh_token cookie
});

// A raw client without interceptors (used for token refresh to avoid recursion)
const rawClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header from closure-stored access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // Set Content-Type to application/json only if not FormData
  // FormData needs to let browser set Content-Type with boundary
  if (!(config.data instanceof FormData)) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
  } else {
    // Remove Content-Type for FormData to let browser set it with boundary
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

// Ensure there is an access token in closure (by refreshing from cookie if needed)
export async function ensureAuth(): Promise<void> {
  if (accessToken) return;
  await refreshAccessToken();
}

// Auto-refresh on 401 and retry once
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Network / CORS / server down
    if (!error.response) {
      throw new Error(`Unable to connect to the server. Please ensure the backend is running at ${API_URL}`);
    }

    // Don't attempt to refresh if the token endpoint itself is failing
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

