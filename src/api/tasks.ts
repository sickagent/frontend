import { apiFetch } from './client';
import type { Task } from './types';

export async function listAdminTasks(params?: {
  status?: string;
  scope?: string;
  agent_id?: string;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.scope) q.set('scope', params.scope);
  if (params?.agent_id) q.set('agent_id', params.agent_id);
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return apiFetch<Task[]>(`/api/v1/admin/tasks${qs ? '?' + qs : ''}`);
}

export async function listRecentTasks(limit = 10) {
  return apiFetch<Task[]>(`/api/v1/admin/tasks/recent?limit=${limit}`);
}

export async function getAdminTask(id: string) {
  return apiFetch<Task>(`/api/v1/admin/tasks/${id}`);
}
