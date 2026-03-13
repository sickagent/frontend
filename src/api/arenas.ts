import { apiFetch } from './client';
import type { Arena, ArenaMessage, LedgerEntry, Task } from './types';

export async function listAdminArenas(limit = 100) {
  return apiFetch<{ arena: Arena; task: Task }[]>(
    `/api/v1/admin/arenas?limit=${limit}`,
  );
}

export async function getAdminArena(id: string) {
  return apiFetch<{ arena: Arena; task: Task }>(`/api/v1/admin/arenas/${id}`);
}

export async function getAdminArenaMessages(id: string, limit = 100) {
  return apiFetch<ArenaMessage[]>(
    `/api/v1/admin/arenas/${id}/messages?limit=${limit}`,
  );
}

export async function getAdminArenaLedger(id: string) {
  return apiFetch<LedgerEntry[]>(`/api/v1/admin/arenas/${id}/ledger`);
}
