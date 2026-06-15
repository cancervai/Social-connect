import axios from 'axios';
import { env } from '../config/env';

const META_API_VERSION = 'v18.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    redirect_uri: env.META_REDIRECT_URI,
    scope: [
      'pages_manage_posts',
      'pages_read_engagement',
      'leads_retrieval',
      'ads_read',
      'business_management',
      'instagram_basic',
      'instagram_content_publish',
    ].join(','),
    response_type: 'code',
    state,
  });
  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in?: number;
}> {
  const response = await axios.get(`${META_BASE_URL}/oauth/access_token`, {
    params: {
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      redirect_uri: env.META_REDIRECT_URI,
      code,
    },
  });
  return response.data;
}

export async function getPages(accessToken: string): Promise<
  Array<{
    id: string;
    name: string;
    category: string;
    access_token: string;
  }>
> {
  const response = await axios.get(`${META_BASE_URL}/me/accounts`, {
    params: { access_token: accessToken, fields: 'id,name,category,access_token' },
  });
  return response.data.data ?? [];
}

export async function publishToPage(
  pageId: string,
  pageAccessToken: string,
  content: string
): Promise<{ id: string }> {
  const response = await axios.post(`${META_BASE_URL}/${pageId}/feed`, {
    message: content,
    access_token: pageAccessToken,
  });
  return response.data;
}

export async function getPageInsights(
  pageId: string,
  pageAccessToken: string,
  since: number,
  until: number
): Promise<unknown> {
  const metrics = [
    'page_impressions',
    'page_reach',
    'page_engaged_users',
    'page_fan_adds',
  ].join(',');

  const response = await axios.get(`${META_BASE_URL}/${pageId}/insights`, {
    params: {
      metric: metrics,
      period: 'day',
      since,
      until,
      access_token: pageAccessToken,
    },
  });
  return response.data.data;
}

export async function getLeadForms(
  pageId: string,
  pageAccessToken: string
): Promise<unknown[]> {
  const response = await axios.get(`${META_BASE_URL}/${pageId}/leadgen_forms`, {
    params: { access_token: pageAccessToken, fields: 'id,name,leads_count' },
  });
  return response.data.data ?? [];
}

export async function getLeadsFromForm(
  formId: string,
  pageAccessToken: string
): Promise<unknown[]> {
  const response = await axios.get(`${META_BASE_URL}/${formId}/leads`, {
    params: {
      access_token: pageAccessToken,
      fields: 'id,created_time,field_data',
    },
  });
  return response.data.data ?? [];
}

export async function getAdCampaigns(accessToken: string, adAccountId: string): Promise<unknown[]> {
  const response = await axios.get(`${META_BASE_URL}/act_${adAccountId}/campaigns`, {
    params: {
      access_token: accessToken,
      fields: 'id,name,status,budget_remaining,daily_budget,lifetime_budget,start_time,stop_time',
    },
  });
  return response.data.data ?? [];
}

export async function getCampaignInsights(
  campaignId: string,
  accessToken: string
): Promise<unknown> {
  const response = await axios.get(`${META_BASE_URL}/${campaignId}/insights`, {
    params: {
      access_token: accessToken,
      fields: 'impressions,clicks,spend,cpc,ctr,reach',
      date_preset: 'last_30d',
    },
  });
  return response.data.data?.[0];
}
