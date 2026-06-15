import axios from 'axios';
import { env } from '../config/env';

const LI_BASE_URL = 'https://api.linkedin.com/v2';
const LI_AUTH_URL = 'https://www.linkedin.com/oauth/v2';

export function buildLinkedInOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: env.LINKEDIN_REDIRECT_URI,
    state,
    scope: [
      'r_liteprofile',
      'r_emailaddress',
      'w_member_social',
      'r_organization_social',
      'w_organization_social',
      'r_ads_reporting',
      'rw_ads',
    ].join(' '),
  });
  return `${LI_AUTH_URL}/authorization?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const response = await axios.post(
    `${LI_AUTH_URL}/accessToken`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.LINKEDIN_REDIRECT_URI,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data;
}

export async function getProfile(
  accessToken: string
): Promise<{ id: string; firstName: string; lastName: string; profilePictureUrl?: string }> {
  const response = await axios.get(`${LI_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
    },
  });

  const data = response.data;
  const firstName = data.firstName?.localized?.en_US ?? '';
  const lastName = data.lastName?.localized?.en_US ?? '';
  const profilePictureUrl =
    data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier;

  return { id: data.id, firstName, lastName, profilePictureUrl };
}

export async function sharePost(
  accessToken: string,
  authorUrn: string,
  content: string
): Promise<{ id: string }> {
  const response = await axios.post(
    `${LI_BASE_URL}/ugcPosts`,
    {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    },
    { headers: { Authorization: `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' } }
  );
  return { id: response.data.id };
}

export async function getOrganizationInsights(
  accessToken: string,
  organizationId: string,
  startMs: number,
  endMs: number
): Promise<unknown> {
  const response = await axios.get(`${LI_BASE_URL}/organizationalEntityShareStatistics`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      q: 'organizationalEntity',
      organizationalEntity: `urn:li:organization:${organizationId}`,
      'timeIntervals.timeGranularityType': 'DAY',
      'timeIntervals.timeRange.start': startMs,
      'timeIntervals.timeRange.end': endMs,
    },
  });
  return response.data.elements;
}

export async function getAdCampaigns(accessToken: string, adAccountId: string): Promise<unknown[]> {
  const response = await axios.get(`${LI_BASE_URL}/adCampaignsV2`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      q: 'search',
      search: `(account:(id:${adAccountId}))`,
      fields: 'id,name,status,totalBudget,costType,startDate,endDate',
    },
  });
  return response.data.elements ?? [];
}

export async function getCampaignInsights(
  accessToken: string,
  campaignId: string
): Promise<unknown> {
  const response = await axios.get(`${LI_BASE_URL}/adAnalyticsV2`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      q: 'analytics',
      pivot: 'CAMPAIGN',
      campaigns: `List(urn:li:sponsoredCampaign:${campaignId})`,
      dateRange: { start: { month: 1, day: 1, year: 2024 } },
      fields: 'impressions,clicks,costInLocalCurrency,approximateUniqueImpressions',
    },
  });
  return response.data.elements?.[0];
}

export async function getLeadGenForms(
  accessToken: string,
  organizationId: string
): Promise<unknown[]> {
  const response = await axios.get(`${LI_BASE_URL}/leadGenerationForms`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      q: 'owner',
      owner: `urn:li:organization:${organizationId}`,
      fields: 'id,name,state,responseCount',
    },
  });
  return response.data.elements ?? [];
}
