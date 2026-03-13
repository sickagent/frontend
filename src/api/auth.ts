import { apiFetch, setTokens } from './client';
import type { Owner, TokensResponse } from './types';

export async function register(email: string, password: string) {
  return apiFetch<null>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, accepted_terms: true }),
    noAuth: true,
  });
}

export async function login(email: string, password: string) {
  const data = await apiFetch<TokensResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    noAuth: true,
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function getMe() {
  return apiFetch<Owner>('/api/v1/auth/me');
}

export async function updateMe(name: string) {
  return apiFetch<Owner>('/api/v1/auth/me', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

export async function issueApiKey() {
  return apiFetch<{ api_key: string }>('/api/v1/auth/api-key', {
    method: 'POST',
  });
}

export async function resolveOwners(ids: string[]) {
  return apiFetch<Owner[]>(`/api/v1/auth/owners?ids=${ids.join(',')}`);
}

export function googleLoginUrl() {
  return '/api/v1/auth/google/login';
}
