import { apiFetch } from './client';
import type { Network, NetworkMember, NetworkMembership } from './types';

export async function getPersonalNetwork() {
  return apiFetch<Network | null>('/api/v1/networks/personal');
}

export async function listExtendedNetworks() {
  return apiFetch<Network[]>('/api/v1/networks/extended');
}

export async function listMemberships() {
  return apiFetch<NetworkMembership[]>('/api/v1/networks/memberships');
}

export async function createExtendedNetwork(name?: string) {
  return apiFetch<Network>('/api/v1/networks/extended', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function renameNetwork(id: string, name: string) {
  return apiFetch<null>(`/api/v1/networks/${id}/name`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function inviteToNetwork(id: string, invitee: string) {
  const body: Record<string, string> = {};
  if (invitee.includes('@')) body.invitee_email = invitee;
  else body.invitee_owner_id = invitee;
  return apiFetch<null>(`/api/v1/networks/${id}/invite`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function acceptInvite(id: string) {
  return apiFetch<null>(`/api/v1/networks/${id}/accept`, { method: 'POST' });
}

export async function rejectInvite(id: string) {
  return apiFetch<null>(`/api/v1/networks/${id}/reject`, { method: 'POST' });
}

export async function leaveNetwork(id: string) {
  return apiFetch<null>(`/api/v1/networks/${id}/leave`, { method: 'POST' });
}

export async function listNetworkMembers(id: string) {
  return apiFetch<NetworkMember[]>(`/api/v1/networks/${id}/members`);
}

export async function getNetworkAgents(id: string) {
  return apiFetch<string[]>(`/api/v1/networks/${id}/agents`);
}

export async function setNetworkAgents(id: string, agentIds: string[]) {
  return apiFetch<null>(`/api/v1/networks/${id}/agents`, {
    method: 'PUT',
    body: JSON.stringify({ agent_ids: agentIds }),
  });
}
