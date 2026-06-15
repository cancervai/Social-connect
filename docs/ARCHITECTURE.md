# Architecture Overview — Social Connect

## System Design

Social Connect follows a **monorepo structure** with a clear client/server split. The two apps communicate exclusively over a REST API. Neither app shares code at runtime.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          React SPA (Vite + TypeScript)                   │   │
│  │  Login → Onboarding → Dashboard → Posts / Analytics /    │   │
│  │          Leads / Campaigns / Settings                    │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/REST (axios)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Node.js + Express API                           │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────────┐   │
│  │  Routes  │→ │ Controllers │→ │       Services           │   │
│  └──────────┘  └─────────────┘  │  ┌────────┐ ┌─────────┐ │   │
│                                  │  │  Meta  │ │LinkedIn │ │   │
│                                  │  │  Svc   │ │  Svc    │ │   │
│                                  │  └───┬────┘ └────┬────┘ │   │
│                                  └──────┼───────────┼──────┘   │
└─────────────────────────────────────────┼───────────┼──────────┘
           ┌──────────────┐               │           │
           │  PostgreSQL  │               ▼           ▼
           │  (Prisma ORM)│     ┌────────────┐ ┌───────────┐
           └──────────────┘     │ Meta Graph │ │ LinkedIn  │
                                │    API     │ │    API    │
                                └────────────┘ └───────────┘
```

---

## Authentication Flow

```
Client                              Server
  │                                   │
  │── POST /auth/register ──────────► │  Hash password (bcrypt)
  │                                   │  Create User + Workspace in DB
  │◄── { accessToken } + cookie ────  │  Set refreshToken in httpOnly cookie
  │                                   │
  │── (subsequent requests) ─────────►│  Authorization: Bearer <accessToken>
  │                                   │  Middleware verifies JWT
  │                                   │  Attaches req.user = { id, role, workspaceId }
  │                                   │
  │── POST /auth/refresh ────────────►│  Reads refreshToken from cookie
  │◄── { accessToken } ─────────────  │  Issues new access token
```

**Token strategy:**
- Access token: 15-minute JWT, stored in React memory (AuthContext state)
- Refresh token: 7-day JWT, stored in `httpOnly` cookie (not accessible to JS)
- On 401 response, the Axios interceptor automatically calls `/auth/refresh` and retries

---

## Data Flow: Post Scheduling

```
1. User fills PostComposer form
2. Client calls POST /posts with { content, platforms, scheduledAt }
3. Server saves Post record with status=SCHEDULED
4. A background job (cron / queue) checks for due posts every minute
5. For each due post:
   a. metaService.publishPost(post) → Meta Graph API /feed or /media
   b. linkedinService.publishPost(post) → LinkedIn /shares endpoint
6. Post record updated to status=PUBLISHED (or FAILED with error)
7. Client polls GET /posts or uses WebSocket notification
```

> **Note for developer:** The background job (step 4) is scaffolded as a placeholder in `server/src/services/schedulerService.ts`. Implement it using `node-cron`, BullMQ (Redis), or a managed queue like Inngest depending on your infrastructure.

---

## Data Flow: OAuth Connection (Meta)

```
Client                   Server                    Meta
  │                        │                        │
  │── GET /meta/oauth/url ►│                        │
  │                        │  Build OAuth URL with  │
  │                        │  scopes + state token  │
  │◄── { url } ───────────│                        │
  │                        │                        │
  │  (redirect to url) ──────────────────────────► │
  │                        │                        │
  │                        │◄── code + state ───── │
  │                        │  (callback redirect)   │
  │                        │                        │
  │                        │  Validate state token  │
  │                        │  Exchange code for     │
  │                        │  access_token          │
  │                        │  Store SocialAccount   │
  │                        │  in DB                 │
  │◄── redirect to /onboarding?step=2 ─────────────│
```

---

## Database Schema

All models live in a single PostgreSQL database managed by Prisma.

```
┌─────────────┐       ┌────────────────┐
│   Workspace │──────<│      User      │
│─────────────│       │────────────────│
│ id          │       │ id             │
│ name        │       │ email          │
│ plan        │       │ passwordHash   │
│ createdAt   │       │ role           │
└──────┬──────┘       │ workspaceId FK │
       │              └────────────────┘
       │ 1:N
  ┌────┴──────────────────────────────────────────┐
  │                                               │
  ▼                      ▼                        ▼
┌───────────────┐  ┌─────────────┐  ┌────────────────┐
│ SocialAccount │  │    Post     │  │    Campaign    │
│───────────────│  │─────────────│  │────────────────│
│ id            │  │ id          │  │ id             │
│ platform      │  │ content     │  │ externalId     │
│ accessToken   │  │ platforms[] │  │ platform       │
│ refreshToken  │  │ status      │  │ name           │
│ expiresAt     │  │ scheduledAt │  │ status         │
│ pageId        │  │ publishedAt │  │ budget         │
│ pageName      │  │ workspaceId │  │ spend          │
│ workspaceId   │  └─────────────┘  │ impressions    │
└───────────────┘                   │ clicks         │
                                    │ workspaceId    │
  ┌─────────────────────────────┐   └────────────────┘
  │          Lead               │
  │─────────────────────────────│
  │ id                          │
  │ firstName / lastName        │
  │ email / phone               │
  │ source (META | LINKEDIN)    │
  │ externalId                  │
  │ status (NEW|CONTACTED|...)  │
  │ metadata (JSON)             │
  │ workspaceId                 │
  └─────────────────────────────┘
```

---

## Folder Structure — Backend

```
server/src/
├── config/
│   ├── env.ts              Zod-validated environment variables (fail-fast on startup)
│   └── database.ts         Prisma client singleton (one instance app-wide)
│
├── middleware/
│   ├── authenticate.ts     Verifies JWT, attaches req.user
│   ├── authorize.ts        Role guard factory: authorize('ADMIN')
│   ├── errorHandler.ts     Global error handler (maps errors to HTTP responses)
│   └── rateLimiter.ts      Two limiters: authLimiter and apiLimiter
│
├── routes/
│   ├── auth.ts             /auth/* — register, login, refresh, logout
│   ├── meta.ts             /meta/* — OAuth, pages, business verification
│   ├── linkedin.ts         /linkedin/* — OAuth, profile, pages
│   ├── posts.ts            /posts/* — CRUD + publish
│   ├── analytics.ts        /analytics/* — overview, platform-specific
│   ├── leads.ts            /leads/* — CRUD + sync from platforms
│   └── campaigns.ts        /campaigns/* — list, detail, metrics
│
├── controllers/
│   └── (one file per route group, mirrors routes/)
│
├── services/
│   ├── metaService.ts      Meta Graph API: auth, pages, posts, leads, ads
│   ├── linkedinService.ts  LinkedIn API: auth, profile, shares, ads
│   └── schedulerService.ts Background job stub for scheduled post publishing
│
├── prisma/
│   ├── schema.prisma       Full database schema
│   └── migrations/         Auto-generated by Prisma migrate
│
└── index.ts                Express app setup, middleware chain, route mounting
```

---

## Folder Structure — Frontend

```
client/src/
├── components/
│   ├── ui/                 Primitive design system components (no business logic)
│   │   ├── Button.tsx      Variants: primary, secondary, ghost, danger; sizes: sm, md, lg
│   │   ├── Card.tsx        Surface container with optional padding and hover state
│   │   ├── Badge.tsx       Status pills: success, warning, error, neutral, info
│   │   ├── Input.tsx       Text input with label, error state, icon support
│   │   ├── Modal.tsx       Accessible dialog with backdrop + focus trap
│   │   ├── Avatar.tsx      User/platform avatar with initials fallback
│   │   ├── Spinner.tsx     Loading indicator (3 sizes)
│   │   └── Tooltip.tsx     Hover tooltip (top/bottom/left/right)
│   │
│   ├── layout/
│   │   ├── AppShell.tsx    Root layout: sidebar + topbar + content area
│   │   ├── Sidebar.tsx     Navigation links, workspace switcher, user menu
│   │   └── TopBar.tsx      Page title, quick actions, notification bell
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx      Step orchestrator
│   │   ├── MetaVerificationStep.tsx  4-step Meta verification sub-wizard
│   │   └── LinkedInConnectStep.tsx   OAuth popup trigger + status
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx             Metric card with trend indicator
│   │   ├── ActivityFeed.tsx         Recent post/lead/campaign events
│   │   ├── PlatformStatus.tsx       Connected platform health cards
│   │   └── QuickCompose.tsx         Compact post composer shortcut
│   │
│   ├── posts/
│   │   ├── PostComposer.tsx         Full-featured post editor
│   │   ├── PostCard.tsx             Post list item with status badge
│   │   ├── PlatformToggle.tsx       Meta / LinkedIn selection chips
│   │   └── ScheduleCalendar.tsx     Date/time picker for scheduling
│   │
│   ├── analytics/
│   │   ├── MetricCard.tsx           Single metric with sparkline
│   │   ├── EngagementLineChart.tsx  Recharts line chart (reach, engagement over time)
│   │   ├── PostPerformanceBar.tsx   Recharts bar chart (per-post metrics)
│   │   ├── PlatformBreakdown.tsx    Side-by-side Meta vs LinkedIn comparison
│   │   └── DateRangePicker.tsx      7d / 30d / 90d / custom range selector
│   │
│   ├── leads/
│   │   ├── LeadsTable.tsx           Sortable, filterable CRM table
│   │   ├── LeadDetail.tsx           Side panel with full lead info
│   │   └── FilterBar.tsx            Source, status, date filters
│   │
│   └── campaigns/
│       ├── CampaignTable.tsx        Campaign list with metrics columns
│       ├── CampaignDetail.tsx       Full campaign metrics panel
│       └── BudgetChart.tsx          Budget vs spend radial/bar chart
│
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OnboardingPage.tsx
│   ├── DashboardPage.tsx
│   ├── PostsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── LeadsPage.tsx
│   ├── CampaignsPage.tsx
│   └── SettingsPage.tsx
│
├── context/
│   ├── AuthContext.tsx     user, accessToken, login(), logout(), refreshToken()
│   └── ThemeContext.tsx    theme (dark/light), toggleTheme()
│
├── hooks/
│   ├── useAuth.ts          Shortcut: const { user } = useAuth()
│   ├── useMeta.ts          Meta OAuth status, pages list
│   └── useLinkedIn.ts      LinkedIn OAuth status, profile info
│
├── services/               One file per domain, all use api.ts base client
│   ├── api.ts              Axios instance with interceptors (auth header + refresh)
│   ├── authService.ts
│   ├── metaService.ts
│   ├── linkedinService.ts
│   ├── postsService.ts
│   ├── analyticsService.ts
│   ├── leadsService.ts
│   └── campaignService.ts
│
├── types/index.ts          All TypeScript interfaces — the single source of truth
├── utils/formatters.ts     formatDate, formatNumber, formatCurrency, truncate
├── App.tsx                 BrowserRouter + route definitions + ProtectedRoute
└── main.tsx                React 18 createRoot mount
```

---

## Security Considerations

| Concern | Implementation |
|---------|---------------|
| Password storage | bcrypt with cost factor 12 |
| JWT secrets | Must be 256-bit random strings in production |
| Refresh token | httpOnly cookie, Secure in production, SameSite=Strict |
| CORS | Allowlist only the client origin; no wildcard `*` in production |
| Rate limiting | Strict on auth endpoints (10 req/15 min), relaxed on API (100 req/15 min) |
| SQL injection | Prisma ORM — parameterized queries by default |
| XSS | No `dangerouslySetInnerHTML`; content rendered as text |
| Secrets in env | Use `.env` (never commit); validate at startup with Zod |
| API keys | Meta + LinkedIn tokens stored encrypted at rest (implement AES-256 before production) |

---

## Extending the App

### Adding a new platform (e.g., Twitter/X)
1. Add `TWITTER` to the `Platform` enum in `schema.prisma`
2. Create `server/src/services/twitterService.ts`
3. Add routes in `server/src/routes/twitter.ts`
4. Add `client/src/services/twitterService.ts`
5. Update `OnboardingWizard.tsx` with a Twitter connect step
6. Add Twitter toggle in `PlatformToggle.tsx`

### Adding a new feature (e.g., Social Inbox)
1. Create `server/src/routes/inbox.ts` + `controllers/inboxController.ts` + `services/inboxService.ts`
2. Add route to `server/src/index.ts`
3. Create `client/src/pages/InboxPage.tsx` + components under `client/src/components/inbox/`
4. Add route in `client/src/App.tsx`
5. Add nav link in `Sidebar.tsx`
6. Document new endpoints in `docs/API.md`
