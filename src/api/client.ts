import type { ApiResponse } from './types';

const TOKEN_KEY = 'sa_access_token';
const REFRESH_KEY = 'sa_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const rt = localStorage.getItem(REFRESH_KEY);
  if (!rt) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return false;
      const json = await res.json();
      if (json.data?.access_token) {
        setTokens(json.data.access_token, json.data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { noAuth?: boolean },
): Promise<T> {
  const { noAuth, ...fetchInit } = init ?? {};

  const headers = new Headers(fetchInit.headers);
  if (!headers.has('Content-Type') && fetchInit.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token && !noAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(path, { ...fetchInit, headers });

  if (res.status === 401 && !noAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(path, { ...fetchInit, headers });
    } else {
      clearTokens();
      window.dispatchEvent(new CustomEvent('sickagent:unauthorized'));
      throw new ApiError(401, 'auth.expired', 'Session expired');
    }
  }

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || (json.error && json.error.length > 0)) {
    throw new ApiError(res.status, json.error || 'unknown', json.message);
  }

  return json.data as T;
}
