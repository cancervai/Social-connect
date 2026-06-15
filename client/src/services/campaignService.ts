import { api } from './api';
import type { Campaign } from '../types';

interface CampaignsResponse { campaigns: Campaign[]; total: number; page: number; limit: number; }
interface GetCampaignsParams { platform?: string; status?: string; page?: number; limit?: number; }

export async function getCampaigns(params?: GetCampaignsParams): Promise<CampaignsResponse> {
  const res = await api.get<{ success: true; data: CampaignsResponse }>('/campaigns', { params });
  return res.data.data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const res = await api.get<{ success: true; data: { campaign: Campaign } }>(`/campaigns/${id}`);
  return res.data.data.campaign;
}

export async function getCampaignMetrics(id: string, range = '30d'): Promise<{ campaign: { id: string; name: string }; timeSeries: unknown[] }> {
  const res = await api.get<{ success: true; data: { campaign: { id: string; name: string }; timeSeries: unknown[] } }>(`/campaigns/${id}/metrics`, { params: { range } });
  return res.data.data;
}
