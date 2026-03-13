import { apiFetch } from './client';
import type { PublicStats } from './types';

export async function getPublicStats() {
  return apiFetch<PublicStats>('/api/v1/stats', { noAuth: true });
}
