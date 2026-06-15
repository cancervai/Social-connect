// ─── Auth ──────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

// ─── Platform ──────────────────────────────────────────────────────────────

export type Platform = 'META' | 'LINKEDIN';

export interface SocialAccount {
  platform: Platform;
  pageName?: string;
  profileName?: string;
  profileImage?: string;
  expiresAt?: string;
}

// ─── Posts ─────────────────────────────────────────────────────────────────

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  errorMsg?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  content: string;
  platforms: Platform[];
  status: 'DRAFT' | 'SCHEDULED';
  scheduledAt?: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalReach: number;
  totalImpressions: number;
  totalEngagements: number;
  engagementRate: number;
  followerGrowth: number;
  postsPublished: number;
}

export interface TimeSeriesPoint {
  date: string;
  reach?: number;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  spend?: number;
}

export interface AnalyticsOverview {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesPoint[];
}

// ─── Leads ─────────────────────────────────────────────────────────────────

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source: Platform;
  externalId?: string;
  status: LeadStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Campaigns ─────────────────────────────────────────────────────────────

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface Campaign {
  id: string;
  externalId: string;
  platform: Platform;
  name: string;
  status: CampaignStatus;
  budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  ctr?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// ─── API ───────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: Record<string, string[]> };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── UI ────────────────────────────────────────────────────────────────────

export type DateRange = '7d' | '30d' | '90d' | 'custom';
