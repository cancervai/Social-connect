# Social Connect

**A premium SaaS dashboard that unifies Meta Business Suite and LinkedIn into a single workspace.**

Social Connect lets your team schedule posts, track analytics, manage leads, and run ad campaigns across Facebook, Instagram, and LinkedIn — all from one beautiful dark-mode interface.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [Features](#features)
8. [API Integration Setup](#api-integration-setup)
9. [Running in Production](#running-in-production)
10. [Developer Notes](#developer-notes)

---

## Project Overview

Social Connect is a **third-party integration platform** that bridges two of the most important B2B social channels:

| Platform | What We Connect |
|----------|----------------|
| **Meta Business Suite** | Facebook Pages, Instagram Business, Meta Ads, Lead Ads, Business Verification |
| **LinkedIn** | Company Pages, LinkedIn Ads, Lead Gen Forms, Analytics |

### Core Modules

- **Posts** — Compose, schedule, and publish content to multiple platforms simultaneously
- **Analytics** — Unified dashboard pulling reach, engagement, impressions, and follower growth
- **Leads** — CRM-style lead capture and management from Meta Lead Ads and LinkedIn Lead Gen Forms
- **Campaigns** — Monitor spend, impressions, clicks, and CPC for paid campaigns on both platforms
- **Onboarding** — Step-by-step guided flows for Meta Business Verification and LinkedIn OAuth

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Recharts | 2.x | Data visualization |
| Lucide React | latest | Icon system |
| date-fns | 3.x | Date formatting & manipulation |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express | 4.x | HTTP framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM + migrations |
| PostgreSQL | 15.x | Primary database |
| JWT | - | Authentication tokens |
| bcrypt | - | Password hashing |
| Zod | 3.x | Runtime validation |
| Helmet | - | Security headers |
| express-rate-limit | - | API rate limiting |
| Axios | 1.x | External API calls |

---

## Prerequisites

Before you start, make sure you have installed:

- **Node.js** v20 LTS or higher → [nodejs.org](https://nodejs.org)
- **PostgreSQL** v15+ running locally or a connection string to a hosted instance
- **npm** v10+ (comes with Node.js)
- A **Meta Developer App** with the following permissions:
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `leads_retrieval`
  - `ads_read`
  - `business_management`
- A **LinkedIn Developer App** with the following permissions:
  - `r_organization_social`
  - `w_organization_social`
  - `r_ads_reporting`
  - `rw_ads`
  - `r_liteprofile`

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd social-connect
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

The API server will start on **http://localhost:3001**

### 3. Set up the frontend (new terminal)

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

The frontend dev server will start on **http://localhost:5173**

### 4. Open the app

Navigate to **http://localhost:5173** in your browser. You should see the login page.

---

## Environment Variables

### `server/.env`

```env
# Application
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/social_connect

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your-access-token-secret-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Meta (Facebook/Instagram)
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:3001/api/meta/oauth/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3001/api/linkedin/oauth/callback
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_META_APP_ID=your-meta-app-id
```

---

## Project Structure

```
social-connect/
├── client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable design system components
│   │   │   ├── layout/        # Page shell, sidebar, topbar
│   │   │   ├── auth/          # Login & register forms
│   │   │   ├── onboarding/    # Meta verification & LinkedIn connect wizards
│   │   │   ├── dashboard/     # Dashboard widgets & stat cards
│   │   │   ├── posts/         # Post composer, scheduler, post cards
│   │   │   ├── analytics/     # Charts, metric cards, platform breakdown
│   │   │   ├── leads/         # CRM table, lead detail, filter bar
│   │   │   └── campaigns/     # Campaign table, metrics, budget chart
│   │   ├── pages/             # Full page components (one per route)
│   │   ├── context/           # React context (Auth, Theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions (axios calls)
│   │   ├── types/             # TypeScript interfaces & types
│   │   └── utils/             # Formatters and helpers
│   └── ...config files
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Env validation, DB connection
│   │   ├── middleware/        # Auth, roles, error handling, rate limiting
│   │   ├── routes/            # Express route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic & external API calls
│   │   └── prisma/            # Database schema & migrations
│   └── ...config files
│
└── docs/                      # Developer documentation
    ├── ARCHITECTURE.md        # System design & data flow
    ├── API.md                 # Full API reference
    └── DESIGN_SYSTEM.md       # Colors, typography, components
```

For a full breakdown, see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Features

### Authentication & Users
- Email/password registration and login
- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie)
- Two roles: **Admin** (full access) and **Member** (read + compose)
- Workspace model: multiple users share one workspace and its connected accounts

### Onboarding Wizard
New workspaces are guided through a 2-part setup:

1. **Meta Business Verification** (4-step wizard):
   - Enter business legal name, address, country
   - Choose verification method (business documents or domain)
   - Upload required documents (trade license, utility bill, or bank statement)
   - Confirmation + status tracking (approval takes 2–5 business days)

2. **LinkedIn Account Connection** (OAuth 2.0 popup):
   - Generates LinkedIn OAuth URL from backend
   - Opens consent screen in popup
   - Backend handles code exchange + token storage
   - Dashboard shows connected profile

### Posts
- Rich text composer with character limits per platform
- Target Meta (Facebook/Instagram) and/or LinkedIn simultaneously
- Schedule for future publish or publish immediately
- Draft → Scheduled → Published → Failed status flow
- Post calendar view

### Analytics
- Overview dashboard: reach, impressions, engagement, follower growth
- Per-platform breakdown: Meta vs LinkedIn side-by-side
- Line charts (7d, 30d, 90d ranges)
- Bar charts for post performance
- Date range picker

### Leads
- Sync leads from Meta Lead Ads and LinkedIn Lead Gen Forms
- CRM table with filters (source, status, date)
- Lead detail panel with full metadata
- Status management: New → Contacted → Qualified → Closed

### Campaigns
- View all active and past campaigns from both platforms
- Key metrics per campaign: budget, spend, impressions, clicks, CPC, CTR
- Budget utilization chart
- Status badges: Active, Paused, Completed, Draft

### Settings
- Workspace name and plan
- Team management (Admin only): invite members, change roles
- Connected accounts: reconnect or disconnect Meta/LinkedIn
- Personal profile: name, email, password change

---

## API Integration Setup

### Meta Business Suite

1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → **Business** type
2. Add products: **Facebook Login**, **Instagram Basic Display**, **Marketing API**
3. Set the OAuth redirect URI in App Settings → Facebook Login → Valid OAuth Redirect URIs:
   `http://localhost:3001/api/meta/oauth/callback`
4. In Business Settings → Security Center, complete Business Verification:
   - Upload trade license or business registration
   - Verify phone number
   - Upload a utility bill or bank statement
   - Wait 2–5 business days

5. Copy **App ID** and **App Secret** to `server/.env`

### LinkedIn

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers) → Create App
2. Verify your company page is linked to the app
3. Under **Auth** tab, add redirect URL:
   `http://localhost:3001/api/linkedin/oauth/callback`
4. Under **Products**, request access to:
   - Share on LinkedIn
   - Marketing Developer Platform
5. Copy **Client ID** and **Client Secret** to `server/.env`

---

## Running in Production

### Build the frontend

```bash
cd client
npm run build
# Output will be in client/dist/
```

### Build the backend

```bash
cd server
npm run build
# Output will be in server/dist/
```

### Environment
- Set `NODE_ENV=production` in your server environment
- Use a hosted PostgreSQL database (e.g., Railway, Supabase, RDS)
- Run `npx prisma migrate deploy` instead of `migrate dev`
- Serve the `client/dist` folder via nginx or a CDN
- Update all `localhost` URLs in `.env` to your production domain
- Set up SSL/HTTPS on your domain before updating Meta/LinkedIn redirect URIs

### Recommended deployment

| Service | What to deploy |
|---------|---------------|
| Railway / Render | Node.js backend + PostgreSQL |
| Vercel / Netlify | React frontend (static build) |

---

## Developer Notes

- **All TypeScript interfaces** are centralized in `client/src/types/index.ts` — extend this file as you add features.
- **Backend routes** are thin; business logic lives in `server/src/services/`. Keep controllers to request/response only.
- **Prisma migrations** — any time you change `schema.prisma`, run `npx prisma migrate dev --name <description>` to generate a new migration.
- **Token storage** — access tokens are stored in-memory (React context), refresh tokens in `httpOnly` cookies. Do NOT change this to `localStorage` — it creates an XSS vulnerability.
- **Rate limits** — auth routes are limited to 10 req/15 min; general API to 100 req/15 min. Adjust in `server/src/middleware/rateLimiter.ts`.
- **Error format** — all API errors follow `{ success: false, error: { code: string, message: string } }`. Keep this consistent.
- See [`docs/API.md`](./docs/API.md) for the full API reference.
- See [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) before building new UI components.
