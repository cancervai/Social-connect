# API Reference — Social Connect

**Base URL:** `http://localhost:3001/api`

All authenticated routes require the `Authorization: Bearer <accessToken>` header.

All responses follow this envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

---

## Authentication (`/auth`)

### POST /auth/register

Create a new user account and workspace.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "MinLength8Chars!",
  "name": "Jane Smith",
  "workspaceName": "Acme Corp"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "Jane Smith", "role": "ADMIN" },
    "accessToken": "eyJ..."
  }
}
```
> Sets `refreshToken` httpOnly cookie.

---

### POST /auth/login

**Request body:**
```json
{ "email": "user@example.com", "password": "yourpassword" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "...", "role": "ADMIN" },
    "accessToken": "eyJ..."
  }
}
```
> Rate limited: 10 requests per 15 minutes per IP.

---

### POST /auth/refresh

Exchange a valid refresh token (from cookie) for a new access token.

**Response `200`:**
```json
{ "success": true, "data": { "accessToken": "eyJ..." } }
```

**Error `401`** if cookie is missing or token is expired.

---

### POST /auth/logout

Clears the refresh token cookie.

**Response `200`:**
```json
{ "success": true, "data": { "message": "Logged out" } }
```

---

## Meta Business Suite (`/meta`)

### GET /meta/oauth/url

Generate the Meta OAuth consent URL. Redirect the user's browser to this URL.

**Response `200`:**
```json
{
  "success": true,
  "data": { "url": "https://www.facebook.com/v18.0/dialog/oauth?client_id=..." }
}
```

---

### GET /meta/oauth/callback

OAuth redirect callback. Handled server-side. On success, redirects browser to `/onboarding?step=2&connected=meta`.

**Query params:** `code`, `state`

---

### GET /meta/pages

List Facebook Pages and Instagram accounts connected to this workspace.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "page_id",
        "name": "My Business Page",
        "category": "Local business",
        "platform": "META",
        "instagramAccount": { "id": "ig_id", "username": "@mybusiness" }
      }
    ]
  }
}
```

---

### POST /meta/verify

Submit a Meta Business Verification request.

**Request body:**
```json
{
  "businessName": "Acme Corp LLC",
  "address": "123 Main St, Dubai, UAE",
  "country": "AE",
  "verificationMethod": "BUSINESS_DOCUMENTS",
  "documents": [
    { "type": "TRADE_LICENSE", "fileUrl": "https://..." },
    { "type": "UTILITY_BILL", "fileUrl": "https://..." }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "verificationId": "uuid", "status": "PENDING", "estimatedDays": "2-5" }
}
```

---

### GET /meta/verify/status

Check the status of a submitted verification.

**Response `200`:**
```json
{
  "success": true,
  "data": { "status": "PENDING" }
}
```
Possible statuses: `PENDING`, `APPROVED`, `REJECTED`, `NOT_STARTED`

---

## LinkedIn (`/linkedin`)

### GET /linkedin/oauth/url

Generate the LinkedIn OAuth consent URL.

**Response `200`:**
```json
{
  "success": true,
  "data": { "url": "https://www.linkedin.com/oauth/v2/authorization?client_id=..." }
}
```

---

### GET /linkedin/oauth/callback

OAuth redirect callback. Handled server-side. On success, redirects to `/onboarding?step=3&connected=linkedin`.

**Query params:** `code`, `state`

---

### GET /linkedin/profile

Get the connected LinkedIn profile for this workspace.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "urn:li:person:abc123",
    "firstName": "Jane",
    "lastName": "Smith",
    "headline": "CEO at Acme Corp",
    "profilePictureUrl": "https://..."
  }
}
```

---

## Posts (`/posts`)

### GET /posts

List posts for the workspace.

**Query params:**
- `status` — filter by `DRAFT`, `SCHEDULED`, `PUBLISHED`, `FAILED`
- `platform` — filter by `META`, `LINKEDIN`, `BOTH`
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 100)
- `from` — ISO date string (start of range)
- `to` — ISO date string (end of range)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "content": "Check out our new product launch! 🚀",
        "platforms": ["META", "LINKEDIN"],
        "status": "SCHEDULED",
        "scheduledAt": "2024-03-15T10:00:00Z",
        "publishedAt": null,
        "createdAt": "2024-03-10T08:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### POST /posts

Create a new post.

**Request body:**
```json
{
  "content": "Exciting news from our team!",
  "platforms": ["META", "LINKEDIN"],
  "status": "SCHEDULED",
  "scheduledAt": "2024-03-15T10:00:00Z"
}
```
Set `status` to `DRAFT` to save without scheduling. Set to `SCHEDULED` with `scheduledAt` to schedule.

**Response `201`:**
```json
{ "success": true, "data": { "post": { "id": "uuid", ... } } }
```

---

### PUT /posts/:id

Update an existing post. Only `DRAFT` and `SCHEDULED` posts can be edited.

**Request body:** Same fields as POST, all optional.

**Response `200`:**
```json
{ "success": true, "data": { "post": { ... } } }
```

---

### DELETE /posts/:id

Delete a post. Only `DRAFT` and `SCHEDULED` posts can be deleted.

**Response `200`:**
```json
{ "success": true, "data": { "message": "Post deleted" } }
```

---

### POST /posts/:id/publish

Publish a post immediately (bypasses scheduling).

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "post": { "id": "uuid", "status": "PUBLISHED", "publishedAt": "2024-03-10T09:15:00Z" },
    "results": {
      "meta": { "success": true, "postId": "fb_post_id" },
      "linkedin": { "success": true, "activityUrn": "urn:li:share:..." }
    }
  }
}
```

---

## Analytics (`/analytics`)

### GET /analytics/overview

Combined metrics across all connected platforms.

**Query params:**
- `range` — `7d`, `30d`, `90d` (default: `30d`)
- `from` / `to` — custom ISO date range (overrides `range`)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalReach": 48200,
      "totalImpressions": 124500,
      "totalEngagements": 3820,
      "engagementRate": 3.07,
      "followerGrowth": 142,
      "postsPublished": 18
    },
    "timeSeries": [
      { "date": "2024-03-01", "reach": 1200, "impressions": 3400, "engagements": 120 }
    ]
  }
}
```

---

### GET /analytics/meta

Meta-specific analytics (Facebook + Instagram).

**Query params:** same as `/analytics/overview`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "facebook": { "reach": 22000, "impressions": 58000, "pageViews": 1200, "pageLikes": 4800 },
    "instagram": { "reach": 26000, "impressions": 66500, "profileVisits": 890, "followers": 12400 },
    "topPosts": [ { "id": "...", "content": "...", "reach": 4200, "likes": 320 } ]
  }
}
```

---

### GET /analytics/linkedin

LinkedIn-specific analytics.

**Query params:** same as `/analytics/overview`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "impressions": 18200,
    "clicks": 840,
    "engagements": 1240,
    "followerGrowth": 68,
    "uniqueVisitors": 320,
    "topPosts": [ { "id": "...", "content": "...", "impressions": 2800, "clicks": 124 } ]
  }
}
```

---

## Leads (`/leads`)

### GET /leads

List leads in the workspace CRM.

**Query params:**
- `source` — `META`, `LINKEDIN`
- `status` — `NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`
- `search` — search by name or email
- `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "uuid",
        "firstName": "Ahmed",
        "lastName": "Hassan",
        "email": "ahmed@company.com",
        "phone": "+971501234567",
        "source": "META",
        "status": "NEW",
        "createdAt": "2024-03-08T14:22:00Z",
        "metadata": { "formName": "Product Inquiry", "campaignName": "Q1 Lead Gen" }
      }
    ],
    "total": 156,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /leads/:id

Get a single lead with full detail.

---

### PUT /leads/:id

Update lead status or notes.

**Request body:**
```json
{ "status": "CONTACTED", "notes": "Called on 15 March, interested in enterprise plan" }
```

---

### DELETE /leads/:id

Delete a lead.

---

### POST /leads/sync

Pull latest leads from Meta Lead Ads and LinkedIn Lead Gen Forms.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "synced": { "meta": 12, "linkedin": 4 },
    "total": 16,
    "lastSyncedAt": "2024-03-10T09:00:00Z"
  }
}
```

---

## Campaigns (`/campaigns`)

### GET /campaigns

List ad campaigns from connected platforms.

**Query params:**
- `platform` — `META`, `LINKEDIN`
- `status` — `ACTIVE`, `PAUSED`, `COMPLETED`, `DRAFT`
- `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "uuid",
        "externalId": "meta_campaign_123",
        "platform": "META",
        "name": "Q1 Brand Awareness",
        "status": "ACTIVE",
        "budget": 5000.00,
        "spend": 2840.50,
        "impressions": 124000,
        "clicks": 3200,
        "cpc": 0.89,
        "ctr": 2.58,
        "startDate": "2024-01-01",
        "endDate": "2024-03-31"
      }
    ],
    "total": 8
  }
}
```

---

### GET /campaigns/:id

Get a single campaign.

---

### GET /campaigns/:id/metrics

Get detailed time-series metrics for a campaign.

**Query params:** `range` — `7d`, `30d`, `all`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "campaign": { "id": "...", "name": "Q1 Brand Awareness" },
    "timeSeries": [
      {
        "date": "2024-03-01",
        "impressions": 4200,
        "clicks": 110,
        "spend": 98.40,
        "cpc": 0.89
      }
    ]
  }
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `TOKEN_EXPIRED` | 401 | Access token expired (retry with /auth/refresh) |
| `FORBIDDEN` | 403 | User lacks required role |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists (e.g., email taken) |
| `RATE_LIMITED` | 429 | Too many requests |
| `META_API_ERROR` | 502 | Error from Meta Graph API |
| `LINKEDIN_API_ERROR` | 502 | Error from LinkedIn API |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
