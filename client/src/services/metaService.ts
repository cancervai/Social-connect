import { api } from './api';

export async function getMetaOAuthUrl(): Promise<string> {
  const res = await api.get<{ success: true; data: { url: string } }>('/meta/oauth/url');
  return res.data.data.url;
}

export async function getMetaPages(): Promise<Array<{ id: string; name: string; category: string }>> {
  const res = await api.get<{ success: true; data: { pages: Array<{ id: string; name: string; category: string }> } }>('/meta/pages');
  return res.data.data.pages;
}

export async function submitMetaVerification(data: {
  businessName: string;
  address: string;
  country: string;
  verificationMethod: 'BUSINESS_DOCUMENTS' | 'DOMAIN';
  documents?: Array<{ type: string; fileUrl: string }>;
}): Promise<{ verificationId: string; status: string; estimatedDays: string }> {
  const res = await api.post<{ success: true; data: { verificationId: string; status: string; estimatedDays: string } }>('/meta/verify', data);
  return res.data.data;
}

export async function getMetaVerificationStatus(): Promise<string> {
  const res = await api.get<{ success: true; data: { status: string } }>('/meta/verify/status');
  return res.data.data.status;
}
