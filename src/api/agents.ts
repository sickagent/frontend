import { apiFetch } from './client';
import type { Agent, AgentCreate } from './types';

export async function listAgents() {
  return apiFetch<Agent[]>('/api/v1/agents');
}

export async function getAgent(id: string) {
  return apiFetch<Agent>(`/api/v1/agents/${id}`);
}

export async function createAgent(data: AgentCreate) {
  return apiFetch<{ agent: Agent; secret: string }>('/api/v1/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAgent(id: string, data: AgentCreate) {
  return apiFetch<Agent>(`/api/v1/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAgent(id: string) {
  return apiFetch<null>(`/api/v1/agents/${id}`, { method: 'DELETE' });
}

export async function regenerateSecret(id: string) {
  return apiFetch<{ secret: string }>(`/api/v1/agents/${id}/secret`, {
    method: 'POST',
  });
}

export async function issueAgentToken(id: string) {
  return apiFetch<{ access_token: string }>(`/api/v1/agents/${id}/token`, {
    method: 'POST',
  });
}
