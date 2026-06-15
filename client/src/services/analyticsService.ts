import { api } from './api';
import type { AnalyticsOverview } from '../types';

interface RangeParams { range?: '7d' | '30d' | '90d'; from?: string; to?: string; }

export async function getOverview(params?: RangeParams): Promise<AnalyticsOverview> {
  const res = await api.get<{ success: true; data: AnalyticsOverview }>('/analytics/overview', { params });
  return res.data.data;
}

export async function getMetaAnalytics(params?: RangeParams): Promise<Record<string, number>> {
  const res = await api.get<{ success: true; data: Record<string, number> }>('/analytics/meta', { params });
  return res.data.data;
}

export async function getLinkedInAnalytics(params?: RangeParams): Promise<Record<string, number>> {
  const res = await api.get<{ success: true; data: Record<string, number> }>('/analytics/linkedin', { params });
  return res.data.data;
}
