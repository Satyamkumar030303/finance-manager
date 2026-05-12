# Finance Manager — Complete Application Architecture

> **Version**: 1.0 — Generated 2026-05-12  
> **Stack**: MERN (MongoDB · Express · React 19 · Node.js)  
> **Status**: Production roadmap — see IMPLEMENTATION_ROADMAP.md

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Folder Structure](#2-folder-structure)
3. [API Flow Diagram](#3-api-flow-diagram)
4. [Database Schema](#4-database-schema)
5. [Authentication Flow](#5-authentication-flow)
6. [Frontend ↔ Backend Communication](#6-frontend--backend-communication)
7. [State Management Flow](#7-state-management-flow)
8. [Existing Working Features](#8-existing-working-features)
9. [Missing Features](#9-missing-features)
10. [Security Analysis](#10-security-analysis)
11. [Performance Bottlenecks](#11-performance-bottlenecks)
12. [Scalability Concerns](#12-scalability-concerns)
13. [Recommended Improvements](#13-recommended-improvements)
14. [AI Integration Architecture](#14-ai-integration-architecture)
15. [Mobile App Architecture](#15-mobile-app-architecture)
16. [Deployment Architecture](#16-deployment-architecture)
17. [High Traffic Handling Strategy](#17-high-traffic-handling-strategy)
18. [SEO Strategy](#18-seo-strategy)
19. [Monetization / Ad Integration Strategy](#19-monetization--ad-integration-strategy)
20. [Technology Versions Reference](#20-technology-versions-reference)

---

## 1. Application Overview

Finance Manager is a personal finance tracking SaaS application. Users track income, expenses, and budgets, visualize spending patterns through interactive charts, and receive AI-powered financial insights.

**Target audience**: Individual users managing personal finances (Indian market primary, global secondary).  
**Business model**: Freemium — basic tracking free, AI insights & advanced features premium.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  React 19 SPA (Vite)          Android App (Capacitor)           │
│  Tailwind CSS · Recharts      SMS Parser · Native plugins        │
└──────────────────┬──────────────────────────────────┬───────────┘
                   │ HTTPS / REST                     │ HTTPS / REST
┌──────────────────▼──────────────────────────────────▼───────────┐
│                         API LAYER                                │
│   Node.js 20 · Express 5 · JWT Auth · Helmet · CORS             │
│   Rate Limiting · Joi Validation · Winston Logging               │
│                                                                  │
│   /api/auth  /api/transactions  /api/budgets                     │
│   /api/ai    /api/users         /api/goals                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│   MongoDB Atlas (primary)    Redis (cache · sessions · queues)   │
│   Collections: users, transactions, budgets, goals, recurring    │
└─────────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│                      AI / ML LAYER                               │
│   LLM Abstraction (Claude / OpenAI)  Financial Score Engine      │
│   Background Analysis Jobs           Prompt Management           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

### Current Structure

```
d:\Projects\Finance manager\
├── finance-backend/                  # Node.js/Express API server
│   ├── src/
│   │   ├── app.js                    # Express app — middleware chain
│   │   ├── server.js                 # Entry point — DB connect + listen
│   │   ├── config/
│   │   │   ├── db.js                 # Mongoose connect()
│   │   │   └── logger.js             # Winston — 4 transports
│   │   ├── controllers/              # Request/response handlers (thin layer)
│   │   │   ├── auth.controller.js
│   │   │   ├── transaction.controller.js  # 328 lines — largest file
│   │   │   └── budget.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT verify → req.user
│   │   │   ├── error.middleware.js   # Global error handler (last in chain)
│   │   │   ├── validate.middleware.js# Joi factory — validates req.body
│   │   │   └── morganMiddleware.js   # HTTP logs → Winston stream
│   │   ├── models/
│   │   │   ├── user.model.js         # name, email, password, monthlyIncome
│   │   │   ├── transaction.model.js  # user, type, category, amount, date (3 indexes)
│   │   │   └── budget.model.js       # user, category, limitAmount, month, year
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # POST /register, POST /login
│   │   │   ├── transaction.routes.js # 8 endpoints
│   │   │   └── budget.routes.js      # 3 endpoints (missing update/delete)
│   │   ├── services/                 # Business logic — called by controllers
│   │   │   ├── auth.service.js       # bcrypt + JWT
│   │   │   ├── transaction.service.js# CRUD + aggregations
│   │   │   ├── budget.service.js     # comparison logic
│   │   │   └── ml.service.js         # ⚠️ EMPTY placeholder
│   │   ├── utils/
│   │   │   ├── stream.js             # Winston write stream
│   │   │   └── financialScore.js     # ⚠️ EMPTY placeholder
│   │   └── validations/
│   │       └── transaction.validator.js  # Joi schema (auth has no validation)
│   ├── logs/                         # combined.log, error.log, exceptions.log
│   ├── .env                          # PORT, MONGO_URI, JWT_SECRET
│   └── .env.example
│
├── finance-frontend/                 # React 19 SPA
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js              # Base URL + Bearer auth interceptor
│   │   │   └── transactionApi.js     # CRUD helpers
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # user state, login(), logout()
│   │   ├── hooks/                    # Custom React Query hooks
│   │   │   ├── useTransactions.js
│   │   │   ├── useCreateTransaction.js
│   │   │   ├── useUpdateTransaction.js
│   │   │   ├── useDeleteTransaction.js
│   │   │   ├── auth/useLogin.js
│   │   │   └── dashboard/useDashboard.js
│   │   ├── components/
│   │   │   ├── charts/               # ExpensePieChart, MonthlyTrendChart, IncomeExpenseChart
│   │   │   ├── layout/               # AppLayout, Sidebar, Header, Navbar(unused)
│   │   │   ├── ui/Card.jsx           # Reusable card
│   │   │   ├── TransactionForm.jsx   # Create/edit form
│   │   │   ├── TransactionList.jsx
│   │   │   ├── TransactionItem.jsx
│   │   │   ├── TransactionFilters.jsx
│   │   │   ├── EditTransactionModal.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   └── SmartInsights.jsx
│   │   ├── pages/
│   │   │   ├── auth/Login.jsx
│   │   │   ├── auth/Register.jsx
│   │   │   ├── dashboard/Dashboard.jsx  # 216 lines — main dashboard
│   │   │   └── TransactionsPage.jsx
│   │   ├── routes/ProtectedRoute.jsx    # localStorage token check
│   │   ├── services/auth.service.js     # login/register API calls
│   │   ├── utils/                       # ⚠️ EMPTY
│   │   ├── App.jsx                      # Router + route definitions
│   │   └── main.jsx                     # ReactDOM + providers
│   ├── .env                             # VITE_API_URL
│   └── vite.config.js
│
├── PROJECT_FULL_ARCHITECTURE.md      # ← this file
└── IMPLEMENTATION_ROADMAP.md         # phase-by-phase build plan
```

### Target Structure (after full build)

```
d:\Projects\Finance manager\
├── finance-backend/
│   └── src/
│       ├── config/            # db, logger, redis, agenda
│       ├── controllers/       # auth, transaction, budget, user, ai, goal, recurring
│       ├── jobs/              # background jobs (ai-analysis, sms-sync, report-gen)
│       ├── middlewares/       # auth, error, validate, morgan, rateLimit, tier-gate
│       ├── models/            # user, transaction, budget, goal, recurringTransaction,
│       │                      #   refreshToken, userPreference
│       ├── routes/            # all route files
│       ├── services/          # auth, transaction, budget, ml, financialScore,
│       │                      #   currency, notification, export
│       ├── utils/             # stream, financialScore, currency, pagination
│       └── validations/       # auth, transaction, budget, goal, user
│
├── finance-frontend/
│   └── src/
│       ├── api/               # axios, all API modules
│       ├── components/        # charts, layout, ui, ai-chat, goals, reports
│       ├── context/           # AuthContext, ThemeContext, CurrencyContext, LangContext
│       ├── hooks/             # all custom hooks per feature
│       ├── i18n/              # translations (en, hi, ta, ml, kn, te, fr, de, es, ar, ja, zh)
│       ├── pages/             # auth, dashboard, transactions, budget, goals,
│       │                      #   reports, settings, profile, ai-assistant
│       ├── routes/            # ProtectedRoute, TierGate
│       ├── services/          # API service modules
│       ├── utils/             # currency, date, number formatters
│       └── workers/           # service worker (PWA)
│
├── docker-compose.yml
├── .github/workflows/         # CI/CD pipelines
└── docs/                      # additional documentation
```

---

## 3. API Flow Diagram

### Request Lifecycle

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Middleware Chain                  │
│                                                             │
│  1. helmet()          → Security headers (CSP, X-Frame)    │
│  2. cors()            → Origin validation                   │
│  3. rateLimit()       → 100 req / 15 min (global)          │
│  4. express.json()    → Body parser                        │
│  5. morganMiddleware  → HTTP log → Winston                  │
│                                                             │
│  6. Router dispatch                                         │
│     ├─ /api/auth/*    → auth.routes.js                     │
│     ├─ /api/trans/*   → authMiddleware → validate → ctrl   │
│     └─ /api/budgets/* → authMiddleware → ctrl              │
│                                                             │
│  7. 404 handler                                            │
│  8. errorHandler      → JSON error response               │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
Controller → Service → Mongoose → MongoDB Atlas
      │
      ▼
JSON Response
```

### All API Endpoints (current)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login → JWT |
| POST | `/api/transactions` | ✓ | Create transaction |
| GET | `/api/transactions` | ✓ | List (paginated, filtered) |
| GET | `/api/transactions/summary` | ✓ | Income/expense/savings totals |
| GET | `/api/transactions/category-summary` | ✓ | Expense by category |
| GET | `/api/transactions/trends` | ✓ | Daily/monthly/yearly trends |
| GET | `/api/transactions/recent` | ✓ | Last 5 transactions |
| PUT | `/api/transactions/:id` | ✓ | Update transaction |
| DELETE | `/api/transactions/:id` | ✓ | Delete transaction |
| POST | `/api/budgets` | ✓ | Create budget |
| GET | `/api/budgets` | ✓ | List budgets by month/year |
| GET | `/api/budgets/comparison` | ✓ | Budget vs actual spending |

### Target API Endpoints (after roadmap)

| Method | Path | Phase | Description |
|--------|------|-------|-------------|
| POST | `/api/auth/refresh` | 1 | Refresh access token |
| POST | `/api/auth/logout` | 1 | Revoke refresh token |
| GET | `/api/users/profile` | 1 | Get user profile |
| PUT | `/api/users/profile` | 1 | Update profile |
| PUT | `/api/users/change-password` | 1 | Change password |
| PUT | `/api/budgets/:id` | 1 | Update budget |
| DELETE | `/api/budgets/:id` | 1 | Delete budget |
| GET | `/api/transactions/export` | 1 | Export CSV |
| POST | `/api/goals` | 1 | Create savings goal |
| GET | `/api/goals` | 1 | List savings goals |
| PUT | `/api/goals/:id` | 1 | Update savings goal |
| DELETE | `/api/goals/:id` | 1 | Delete savings goal |
| POST | `/api/recurring` | 1 | Create recurring transaction |
| GET | `/api/recurring` | 1 | List recurring transactions |
| GET | `/api/reports/monthly` | 1 | Monthly report data |
| POST | `/api/ai/chat` | 2 | AI assistant chat |
| GET | `/api/ai/score` | 2 | Financial health score |
| GET | `/api/ai/recommendations` | 2 | Personalized recommendations |
| GET | `/api/ai/predict` | 2 | Spending forecast |
| GET | `/api/dashboard` | 6 | Consolidated dashboard (replaces 3 calls) |

---

## 4. Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, bcrypt-hashed, minlength: 6),
  monthlyIncome: Number (default: 0),
  // ─── To be added ───
  tier: String (enum: ['free', 'premium'], default: 'free'),
  preferredCurrency: String (default: 'INR'),
  preferredLanguage: String (default: 'en'),
  avatarUrl: String,
  isVerified: Boolean (default: false),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
Indexes: email (unique)
```

### Transactions Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId → User (required, indexed),
  type: String (enum: ['income', 'expense'], required),
  category: String (required, trimmed, PascalCase normalized),
  amount: Number (required, min: 0),
  description: String (optional, trimmed),
  transactionDate: Date (default: now),
  // ─── To be added ───
  source: String (enum: ['manual', 'sms', 'recurring'], default: 'manual'),
  currency: String (default: 'INR'),
  originalAmount: Number,
  originalCurrency: String,
  merchant: String,
  recurringId: ObjectId → RecurringTransaction,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
Indexes:
  { user: 1, transactionDate: -1 }
  { user: 1, category: 1 }
  { user: 1, type: 1 }
  { user: 1, source: 1 }  ← to add
```

### Budgets Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId → User (required),
  category: String (required, trimmed, PascalCase — fix inconsistency),
  limitAmount: Number (required, min: 0),
  month: Number (required, 1–12),
  year: Number (required),
  alertThreshold: Number (default: 80),  // % of limit to trigger alert
  createdAt: Date,
  updatedAt: Date
}
Indexes:
  { user: 1, month: 1, year: 1 }
  { user: 1, category: 1, month: 1, year: 1 } (unique) ← to add
```

### SavingsGoals Collection (to add)

```javascript
{
  _id: ObjectId,
  user: ObjectId → User (required),
  name: String (required),
  targetAmount: Number (required),
  savedAmount: Number (default: 0),
  deadline: Date,
  category: String,
  isCompleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### RecurringTransactions Collection (to add)

```javascript
{
  _id: ObjectId,
  user: ObjectId → User (required),
  type: String (enum: ['income', 'expense']),
  category: String,
  amount: Number,
  description: String,
  frequency: String (enum: ['daily', 'weekly', 'monthly', 'yearly']),
  nextRunDate: Date,
  lastRunDate: Date,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshTokens Collection (to add)

```javascript
{
  _id: ObjectId,
  user: ObjectId → User,
  token: String (hashed),
  device: String,
  expiresAt: Date,
  createdAt: Date
}
TTL index: { expiresAt: 1 }
```

### Entity Relationship Diagram

```
User ─┬──< Transaction   (one user, many transactions)
      ├──< Budget         (one user, many budgets)
      ├──< SavingsGoal    (one user, many goals)
      ├──< RecurringTransaction (one user, many recurring)
      └──< RefreshToken   (one user, many device sessions)

RecurringTransaction ──< Transaction (source = 'recurring')
```

---

## 5. Authentication Flow

### Current Flow (Access Token Only)

```
Register:
  Client → POST /auth/register {name, email, password}
    → bcrypt.hash(password, 10)
    → User.create()
    → return {user} (201)
    ⚠️ No Joi validation currently

Login:
  Client → POST /auth/login {email, password}
    → User.findOne({email})
    → bcrypt.compare(password, hash)
    → jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: '7d'})
    → return {token, user} (200)
    ⚠️ Token stored in localStorage (XSS risk)

Subsequent Requests:
  Client → axios interceptor reads localStorage token
    → sets Authorization: Bearer <token>
    → auth.middleware.js: jwt.verify(token, JWT_SECRET)
    → req.user = decoded (contains {id})
    → next()

ProtectedRoute:
  → checks !!localStorage.getItem('token')
  → if absent, redirect to /login
  ⚠️ No server-side validation (stale tokens work until expiry)
```

### Target Flow (Access + Refresh Tokens)

```
Login:
  POST /auth/login
    → short-lived Access Token (15 min) in response body
    → long-lived Refresh Token (30 days) in httpOnly cookie
    → RefreshToken saved to DB (hashed)

Access Token Refresh:
  POST /auth/refresh (automatic via Axios interceptor)
    → reads httpOnly cookie
    → validates Refresh Token in DB
    → returns new Access Token (15 min)
    → rotates Refresh Token (new token, old deleted)

Logout:
  POST /auth/logout
    → deletes Refresh Token from DB
    → clears httpOnly cookie

Device Sessions:
  RefreshToken stores device info
  User can see/revoke active sessions
```

---

## 6. Frontend ↔ Backend Communication

### Axios Configuration

```javascript
// src/api/axios.js
baseURL: process.env.VITE_API_URL  // http://localhost:5000/api

// Request interceptor:
  reads localStorage token → Authorization: Bearer <token>

// Missing (to add):
  Response interceptor:
    → on 401 → attempt token refresh
    → on refresh fail → logout + redirect /login
    → on network error → show toast
```

### React Query Cache Strategy

| Query Key | Stale Time | Cache Time | Invalidated By |
|-----------|-----------|------------|----------------|
| `["dashboard", period]` | 0 (always fresh) | 0 | create/update/delete transaction |
| `["transactions", filters]` | 0 | 5 min | create/update/delete |
| `["budgets", month, year]` | 5 min | 10 min | create budget |
| `["goals"]` | 5 min | 10 min | create/update goal |

**Problem**: `staleTime: 0` on dashboard causes 3 separate API calls on every mount.  
**Fix**: Consolidate into single `/api/dashboard` endpoint + set `staleTime: 30000`.

### API Data Flow — Dashboard

```
Current (inefficient — 3 round trips):
  Dashboard mount
    ├─ GET /transactions/summary?period=month
    ├─ GET /transactions/category-summary?period=month
    ├─ GET /transactions/trends?period=month
    └─ GET /transactions/recent

Target (1 round trip):
  Dashboard mount
    └─ GET /dashboard?period=month
         returns: { summary, categoryBreakdown, trends, recentTransactions }
```

---

## 7. State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Application Tree                       │
│                                                                  │
│  QueryClientProvider (TanStack Query — server state)            │
│    └─ AuthProvider (AuthContext — user session)                 │
│         ├─ CurrencyProvider   (planned)                         │
│         ├─ LanguageProvider   (planned — react-i18next)         │
│         └─ ThemeProvider      (planned — dark/light)            │
│              └─ <App /> → React Router                          │
│                   ├─ /login → Login (no auth needed)            │
│                   ├─ /register → Register                       │
│                   └─ ProtectedRoute → AppLayout                 │
│                        ├─ /  → Dashboard                        │
│                        ├─ /transactions → TransactionsPage      │
│                        ├─ /budgets → BudgetsPage     (planned)  │
│                        ├─ /goals → GoalsPage          (planned)  │
│                        ├─ /ai-assistant → AIChat      (planned)  │
│                        ├─ /reports → Reports          (planned)  │
│                        └─ /settings → Settings        (planned)  │
└─────────────────────────────────────────────────────────────────┘

State Ownership:
  Server state    → TanStack Query (transactions, budgets, dashboard)
  Auth state      → React Context (user, token)
  Form state      → React Hook Form
  UI state        → local useState (modals, filters, sidebar open)
  Global prefs    → React Context (currency, language, theme)
```

---

## 8. Existing Working Features

### Authentication
- **Register**: POST /auth/register → bcrypt(10) → User created
- **Login**: POST /auth/login → JWT (7d) → token in localStorage
- **Protected routes**: ProtectedRoute component checks localStorage
- **Auto-auth**: Axios interceptor injects Bearer token

### Transaction Management (Full CRUD)
- **Create**: POST with type, category, amount, date, description
- **Read**: GET with filters (type, category, date range) + pagination
- **Update**: PUT by ID (user-owned only)
- **Delete**: DELETE by ID (user-owned only)
- **Recent**: GET last 5 transactions

### Dashboard Analytics
- **Period selector**: month / lastMonth / year / decade / all
- **Summary cards**: Total Income (green), Total Expense (red), Net Savings (blue)
- **Charts**:
  - `ExpensePieChart`: Expenses by category (PieChart)
  - `MonthlyTrendChart`: Spending over time (LineChart)
  - `IncomeExpenseChart`: Income vs expense vs savings (BarChart)
- **Smart Insights**: Top spending category, savings rate, total expense summary
- **Recent Transactions**: Last 5 with category, amount, date

### Budget Management
- **Create**: POST with category, limitAmount, month, year
- **List**: GET budgets for specific month/year
- **Comparison**: GET budget vs actual spending with Over/Within status

---

## 9. Missing Features

### Critical (Blocking Production)
| Feature | Status | Location |
|---------|--------|----------|
| Budget update (PUT /budgets/:id) | ❌ Missing | backend + frontend |
| Budget delete (DELETE /budgets/:id) | ❌ Missing | backend + frontend |
| Auth route Joi validation | ❌ Missing | auth.routes.js |
| Refresh tokens | ❌ Missing | entire system |
| CORS origin restriction | ❌ Open | app.js |
| Category normalization consistency | ❌ Bug | both layers |

### Core Features Not Yet Built
| Feature | Status |
|---------|--------|
| User profile/settings page | ❌ |
| Change password | ❌ |
| Transaction search | ❌ |
| Export transactions (CSV/PDF) | ❌ |
| Savings goals | ❌ |
| Recurring transactions | ❌ |
| Budget alerts | ❌ |
| Monthly/annual reports | ❌ |
| Financial health score | ❌ (placeholder) |

### Advanced Features
| Feature | Status |
|---------|--------|
| AI financial assistant | ❌ (ml.service.js empty) |
| Android app (Capacitor) | ❌ |
| SMS auto-detection & parsing | ❌ |
| Internationalization (i18n) | ❌ |
| Multi-currency support | ❌ |
| Redis caching | ❌ |
| WebSocket real-time updates | ❌ |
| PWA / service worker | ❌ |
| SEO setup | ❌ |
| Docker / CI/CD | ❌ |
| Subscription / monetization | ❌ |
| Google Ads integration | ❌ |

---

## 10. Security Analysis

### Current Issues (Priority Ordered)

| # | Severity | Issue | Location | Fix |
|---|----------|-------|----------|-----|
| 1 | HIGH | JWT stored in localStorage (XSS risk) | AuthContext.jsx | Move to httpOnly cookie |
| 2 | HIGH | No refresh token mechanism | auth.service.js | Implement rotate + revoke |
| 3 | HIGH | JWT_SECRET is weak & hard-coded | .env | Strong secret, env management |
| 4 | HIGH | MongoDB URI with credentials in .env | .env | Use secrets manager in prod |
| 5 | HIGH | CORS fully open (no origin check) | app.js | `cors({ origin: process.env.CLIENT_URL })` |
| 6 | MEDIUM | No Joi validation on auth routes | auth.routes.js | Add registerSchema, loginSchema |
| 7 | MEDIUM | recharts in backend package.json | package.json | Remove — frontend-only library |
| 8 | MEDIUM | Category naming inconsistency | controllers | Normalize to PascalCase everywhere |
| 9 | LOW | No rate limit per-user (only global) | app.js | Add user-scoped limiter on sensitive routes |
| 10 | LOW | Error messages expose internals | error.middleware.js | Sanitize in production |

### Security Improvements Planned
- `helmet` with custom CSP rules (block inline scripts in production)
- `express-mongo-sanitize` to prevent NoSQL injection
- `hpp` (HTTP parameter pollution) protection
- Input length limits on all text fields
- CSRF protection for cookie-based auth
- Audit logging for sensitive operations
- GDPR-ready: data export + account deletion endpoints

---

## 11. Performance Bottlenecks

### Backend
1. **Dashboard: 3 separate DB aggregations** triggered from 1 page load  
   → Consolidate into single `/api/dashboard` with $facet aggregation

2. **No caching** — every dashboard load hits MongoDB  
   → Add Redis with 5-min TTL for dashboard summaries

3. **Global rate limit only** — abusive users share the quota with legitimate users  
   → Add per-user rate limiting on AI endpoints

4. **Mongoose connection pool**: default (5 connections)  
   → Tune to `maxPoolSize: 50` for production

5. **Transaction aggregations**: no compound index on `{user, type, category, transactionDate}`  
   → Add covering index for category-summary query

### Frontend
1. **staleTime: 0** on all queries — every page visit fires API calls  
   → Set 30s staleTime on dashboard, 60s on budgets

2. **Dashboard: 3 independent `useEffect` fetches** for charts, category, recent  
   → Replace with single `useDashboard` query returning all data

3. **No code splitting** — entire app in one bundle  
   → Add `React.lazy()` + route-level `Suspense`

4. **Recharts not tree-shaken** — imports entire library  
   → Use named imports: `import { PieChart, Pie } from 'recharts'`

5. **No image optimization** — will matter when avatars/receipts added  
   → Use `<img loading="lazy">`, WebP format, CDN

---

## 12. Scalability Concerns

### Single Points of Failure
- Single MongoDB instance (no replica set)
- No horizontal scaling config for Node.js process
- No load balancer

### Architecture Limitations
- In-memory session state (none currently, but will matter with WebSockets)
- Background jobs not yet architected (will need worker processes)
- AI API calls are synchronous (will block on slow LLM responses)

### Target Scalability Architecture

```
                        [Load Balancer / Nginx]
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        [API Server 1]  [API Server 2]  [API Server 3]
         Node.js PM2     Node.js PM2     Node.js PM2
              │                │                │
              └────────────────┼────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        [MongoDB RS]     [Redis Cluster]  [Bull Queue]
         Primary +           Cache +       Background
         2 Secondaries       Sessions      AI Jobs
```

---

## 13. Recommended Improvements

### Immediate (Phase 1)
1. Fix all security issues in table above
2. Add missing budget endpoints
3. Add user profile management
4. Implement financial score algorithm
5. Add transaction export

### Short-term (Phase 2–3)
1. AI assistant (ml.service.js implementation)
2. Android app via Capacitor
3. SMS auto-parsing
4. i18n (12 languages)
5. Multi-currency

### Medium-term (Phase 4–6)
1. Redis caching layer
2. Consolidated dashboard endpoint
3. Background jobs (Agenda.js)
4. WebSocket for real-time updates
5. Docker + CI/CD

### Long-term (Phase 7–9)
1. SSR or React Helmet for SEO
2. PWA + service worker
3. Subscription / Stripe integration
4. Google Ads
5. Analytics + monitoring (Sentry, Datadog)

---

## 14. AI Integration Architecture

### Design Philosophy
- LLM-agnostic abstraction layer (swap Claude ↔ OpenAI without changing callers)
- Structured outputs for reliable parsing
- Background analysis (non-blocking)
- Cost optimization via caching repeated analyses

### ML Service Architecture

```
ml.service.js
├── class LLMProvider (abstract)
│   ├── ClaudeProvider (Anthropic claude-sonnet-4-6)
│   └── OpenAIProvider (gpt-4o)
│
├── FinancialAnalyzer
│   ├── analyzeSpending(userId)     → spending patterns
│   ├── detectSubscriptions(txns)   → recurring charges
│   ├── detectAnomalies(txns)       → unusual spending
│   └── forecastNextMonth(userId)   → ML prediction
│
├── RecommendationEngine
│   ├── getBudgetSuggestions(data)  → category budget recommendations
│   ├── getSavingsTips(data)        → actionable savings advice
│   └── getInvestmentHints(data)    → general (not financial advice)
│
└── ChatAssistant
    ├── chat(userId, message)       → conversational finance help
    └── getContext(userId)          → retrieve user financial context
```

### Financial Score Algorithm

```
financialScore.js

Score (0–100) = weighted composite:
  ┌─────────────────────────────────────────┐
  │ Savings Rate          (25 pts max)      │
  │   = (income - expense) / income × 100  │
  │                                         │
  │ Budget Adherence      (25 pts max)      │
  │   = (categories within budget / total) │
  │                                         │
  │ Expense Consistency   (20 pts max)      │
  │   = low variance in monthly spending   │
  │                                         │
  │ Debt-to-Income        (15 pts max)      │
  │   = EMI + loans / monthly income       │
  │                                         │
  │ Emergency Fund        (15 pts max)      │
  │   = savings balance ≥ 3× monthly exp   │
  └─────────────────────────────────────────┘

Score bands:
  80–100  → Excellent 🟢
  60–79   → Good      🟡
  40–59   → Fair      🟠
  0–39    → Poor      🔴
```

### Prompt Management

```
src/prompts/
├── system-prompt.js     → base financial advisor persona
├── analysis.js          → spending analysis prompts
├── recommendations.js   → advice generation prompts
├── sms-parser.js        → SMS classification prompts (Android)
└── chat.js              → conversational assistant prompts
```

### AI Background Jobs

```
Agenda.js jobs:
  monthly-analysis    → runs on 1st of each month, 9am
  weekly-insights     → runs every Sunday, 8am
  anomaly-detection   → runs nightly, 2am
  recurring-processor → runs daily, 6am (create transactions from recurring)
```

---

## 15. Mobile App Architecture

### Capacitor Setup

```
finance-frontend/        (existing React codebase — shared)
├── capacitor.config.ts  → app ID, server URL
├── android/             → native Android project
│   └── app/src/main/
│       ├── assets/      → compiled React web assets
│       └── java/        → native Java/Kotlin bridges
└── src/
    ├── plugins/
    │   ├── SmsPlugin.ts     → SMS read permission + listener
    │   └── BiometricPlugin.ts → fingerprint auth
    └── services/
        └── smsSync.service.ts → parse + queue + sync
```

### SMS Auto-Detection Flow

```
Android SMS Received
        │
        ▼
SmsPlugin (native Capacitor plugin)
        │ raw SMS text + sender
        ▼
SMS Filter Layer
  → Is financial SMS? (sender whitelist: banks, UPI, wallets)
  → if not → ignore
        │
        ▼
SMS Parser (local regex patterns first — fast, free)
  → "Rs [amount] debited"    → expense
  → "credited ₹[amount]"     → income
  → "UPI [amount] to [name]" → UPI expense
  → "Salary credited"        → income, category: Salary
  → "Amazon" / "Swiggy"      → category lookup table
        │
        ▼ (if regex fails or ambiguous)
LLM Classification (Claude Haiku — fast + cheap)
  → structured output: { type, amount, category, merchant, date }
        │
        ▼
Transaction Queue (offline-capable)
  → IndexedDB queue
  → Background sync when online
  → Deduplicate (hash of amount+date+sender)
        │
        ▼
POST /api/transactions (with source: 'sms')
        │
        ▼
Dashboard updates (React Query invalidation or WebSocket push)
```

### SMS Category Mapping

| Pattern | Category |
|---------|----------|
| Swiggy, Zomato, food, restaurant | Food |
| Amazon, Flipkart, Myntra, shopping | Shopping |
| Uber, Ola, fuel, petrol, transport | Transport |
| Netflix, Spotify, subscription | Entertainment |
| Electricity, water, gas, utility | Utilities |
| Hospital, pharmacy, medical | Health |
| School, college, education | Education |
| Recharge, mobile, DTH | Telecom |
| Salary, credit | Income |
| EMI, loan payment | Finance |
| Hotel, flights, travel | Travel |

---

## 16. Deployment Architecture

### Development

```
Local:
  npm run dev (backend on :5000)
  npm run dev (frontend on :5173)
  MongoDB Atlas (cloud)
```

### Production (Target)

```
                    ┌──────────────┐
                    │  CloudFlare  │  (DNS + CDN + DDoS protection)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    Nginx     │  (Reverse proxy + SSL termination)
                    │   :80/:443   │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
  ┌──────▼──────┐  ┌───────▼─────┐  ┌───────▼─────┐
  │ API Server  │  │ API Server  │  │ API Server  │
  │ (Node PM2)  │  │ (Node PM2)  │  │ (Node PM2)  │
  │   :5000     │  │   :5001     │  │   :5002     │
  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
         └────────────────┼─────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
  │  MongoDB    │  │    Redis    │  │  Bull Queue │
  │  Atlas RS   │  │   Cluster   │  │  (Workers)  │
  └─────────────┘  └─────────────┘  └─────────────┘

Frontend:
  React build → Nginx static files / Vercel / Netlify
  CDN: static assets via CloudFlare
```

### Docker Compose (Target)

```yaml
services:
  backend:    Node.js API (port 5000)
  frontend:   Nginx serving React build (port 3000)
  mongodb:    MongoDB 7 (port 27017) [dev only; prod uses Atlas]
  redis:      Redis 7 (port 6379)
  worker:     Background job processor (same codebase, different entry)
```

---

## 17. High Traffic Handling Strategy

### Layer-by-Layer Strategy

| Layer | Strategy |
|-------|---------|
| DNS | CloudFlare proxied — DDoS protection, anycast routing |
| CDN | Static assets cached at edge (JS, CSS, images) |
| Load balancer | Nginx round-robin across 3 Node.js instances |
| Application | PM2 cluster mode (1 process per CPU core) |
| API rate limiting | Global: 100/15min; Auth: 10/15min; AI: 20/hour |
| Caching | Redis: dashboard summaries (5min TTL), user sessions |
| Database | MongoDB Atlas M30+ with read replicas; aggregation indexes |
| Queue | Bull + Redis for AI jobs, SMS sync, report generation |
| Connection pool | Mongoose maxPoolSize: 50 per instance |

### Caching Strategy

```
Request → API
  ├─ Cache hit (Redis)?  → return immediately (< 1ms)
  └─ Cache miss?
       → query MongoDB
       → store result in Redis (TTL: 300s)
       → return result

Cache keys:
  dashboard:{userId}:{period}   TTL: 300s
  category-summary:{userId}:{month}:{year}  TTL: 600s
  financial-score:{userId}  TTL: 3600s

Cache invalidation:
  On transaction create/update/delete:
    → delete dashboard:{userId}:*
    → delete category-summary:{userId}:*
```

---

## 18. SEO Strategy

### Current State
- React SPA — no SEO (CSR only, empty HTML shell)
- No meta tags, no sitemap, no robots.txt

### Target Architecture

```
Option A (recommended for this app): React Helmet + prerendering
  react-helmet-async → dynamic meta tags per route
  @vitejs/vite-plugin-ssr → prerender public pages
  
Public pages (SEO priority):
  /           → landing page (not behind auth)
  /features   → feature descriptions
  /pricing    → pricing page
  /blog/*     → financial tips content (SEO traffic)

Authenticated pages:
  /dashboard  → not indexed (private data)
  /transactions → not indexed
```

### SEO Implementation Checklist
- `<title>` and `<meta description>` per route via react-helmet-async
- OpenGraph tags for social sharing
- Structured data (JSON-LD: SoftwareApplication schema)
- `sitemap.xml` for public pages
- `robots.txt` (disallow /api, /dashboard, /transactions)
- Canonical URLs
- Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Target Lighthouse score: **95+**

---

## 19. Monetization / Ad Integration Strategy

### Freemium Model

| Feature | Free | Premium (₹99/mo) |
|---------|------|-----------------|
| Transaction tracking | ✓ Unlimited | ✓ Unlimited |
| Budgets | ✓ 3 categories | ✓ Unlimited |
| Dashboard & charts | ✓ Basic | ✓ Advanced |
| Export (CSV) | ✓ | ✓ |
| AI Assistant | ✗ | ✓ |
| Financial score | ✗ | ✓ |
| Savings goals | 1 goal | ✓ Unlimited |
| Recurring transactions | ✗ | ✓ |
| SMS auto-detection | ✓ (Android) | ✓ Priority processing |
| Monthly reports | ✗ | ✓ |
| Multi-currency | ✗ | ✓ |
| Ad-free experience | ✗ | ✓ |

### Ad Integration

```
Google AdSense / AdMob (web + Android):
  - Banner ads: bottom of dashboard (free tier only)
  - Interstitial: monthly report generation (free tier)
  - Native ads: between transaction list items (mobile, free tier)

Performance constraints:
  - Ads loaded async (no render blocking)
  - No ads on /login, /register
  - Ads respected with user consent (GDPR/privacy)
  - AdSense script only loaded for free-tier users
```

### Payment Integration
- **Stripe** (international) + **Razorpay** (India)
- Subscription via `User.tier = 'premium'`
- Webhook → update tier on payment success
- Proration on cancel (end of billing period)

---

## 20. Technology Versions Reference

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| node | 20.x | Runtime |
| express | ^5.2.1 | Web framework |
| mongoose | ^9.2.1 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT tokens |
| joi | ^18.0.2 | Request validation |
| cors | ^2.8.6 | CORS handling |
| helmet | ^8.1.0 | Security headers |
| express-rate-limit | ^8.2.1 | Rate limiting |
| morgan | ^1.10.1 | HTTP logging |
| winston | ^3.19.0 | Application logging |
| dotenv | ^17.3.1 | Env variables |
| axios | ^1.13.5 | HTTP client (AI APIs) |

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | DOM renderer |
| react-router-dom | ^7.13.0 | Routing |
| @tanstack/react-query | ^5.90.21 | Server state |
| axios | ^1.13.5 | HTTP client |
| react-hook-form | ^7.71.2 | Form state |
| zod | ^4.3.6 | Schema validation |
| recharts | ^3.8.0 | Charts |
| lucide-react | ^0.577.0 | Icons |
| react-hot-toast | ^2.6.0 | Notifications |
| tailwindcss | ^3.4.13 | Styling |
| vite | ^7.3.1 | Build tool |
