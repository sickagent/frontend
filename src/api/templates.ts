import { apiFetch } from './client';
import type { TeamTemplate, TeamTemplateStep } from './types';

export async function listTemplates(limit = 50) {
  return apiFetch<TeamTemplate[]>(`/api/v1/templates/teams?limit=${limit}`);
}

export async function getTemplate(id: string) {
  return apiFetch<TeamTemplate>(`/api/v1/templates/teams/${id}`);
}

export async function createTemplate(data: { name: string; steps: TeamTemplateStep[] }) {
  return apiFetch<TeamTemplate>('/api/v1/templates/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteTemplate(id: string) {
  return apiFetch<null>(`/api/v1/templates/teams/${id}`, { method: 'DELETE' });
}
