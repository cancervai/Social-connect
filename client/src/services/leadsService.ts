import { api } from './api';
import type { Lead, LeadStatus } from '../types';

interface LeadsResponse { leads: Lead[]; total: number; page: number; limit: number; }
interface GetLeadsParams { source?: string; status?: string; search?: string; page?: number; limit?: number; }

export async function getLeads(params?: GetLeadsParams): Promise<LeadsResponse> {
  const res = await api.get<{ success: true; data: LeadsResponse }>('/leads', { params });
  return res.data.data;
}

export async function getLead(id: string): Promise<Lead> {
  const res = await api.get<{ success: true; data: { lead: Lead } }>(`/leads/${id}`);
  return res.data.data.lead;
}

export async function updateLead(id: string, data: { status?: LeadStatus; notes?: string }): Promise<Lead> {
  const res = await api.put<{ success: true; data: { lead: Lead } }>(`/leads/${id}`, data);
  return res.data.data.lead;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`);
}

export async function syncLeads(): Promise<{ synced: { meta: number; linkedin: number }; total: number; lastSyncedAt: string }> {
  const res = await api.post<{ success: true; data: { synced: { meta: number; linkedin: number }; total: number; lastSyncedAt: string } }>('/leads/sync');
  return res.data.data;
}
