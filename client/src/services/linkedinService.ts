import { api } from './api';

export async function getLinkedInOAuthUrl(): Promise<string> {
  const res = await api.get<{ success: true; data: { url: string } }>('/linkedin/oauth/url');
  return res.data.data.url;
}

export async function getLinkedInProfile(): Promise<{ id: string; name: string; profilePictureUrl?: string }> {
  const res = await api.get<{ success: true; data: { id: string; name: string; profilePictureUrl?: string } }>('/linkedin/profile');
  return res.data.data;
}
