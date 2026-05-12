# Finance Manager — Implementation Roadmap

> **Version**: 1.0 — Generated 2026-05-12  
> **Goal**: Transform half-finished MERN app into production-ready AI Finance Platform  
> **Rule**: Never break existing working features. Implement phase by phase with commits.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete and working |
| 🔧 | Partially implemented / needs fixing |
| ❌ | Not yet built |
| 🔴 | Critical / blocking production |
| 🟡 | Important / high value |
| 🟢 | Enhancement / nice-to-have |

---

## Current State Snapshot

### What Exists & Works
- ✅ User registration with bcrypt password hashing
- ✅ User login with JWT token (7-day expiry)
- ✅ Transaction CRUD (create, read, update, delete) with pagination
- ✅ Transaction filters (by type, category, date range)
- ✅ Dashboard with period selector (month/lastMonth/year/decade/all)
- ✅ Dashboard charts: Pie (expense by category), Line (trends), Bar (income vs expense)
- ✅ Smart Insights (top category, savings rate, expense summary)
- ✅ Recent transactions list
- ✅ Budget creation (per category per month/year)
- ✅ Budget listing (by month/year)
- ✅ Budget vs actual spending comparison
- ✅ Winston logging (4 transports: console, combined, error, exceptions)
- ✅ Morgan HTTP request logging
- ✅ Helmet security headers
- ✅ Global rate limiting (100 req/15min)
- ✅ Joi validation middleware (transactions only)
- ✅ Error handling middleware
- ✅ React Query for server state management
- ✅ Axios with auth interceptor
- ✅ Toast notifications (react-hot-toast)
- ✅ Responsive layout with collapsible sidebar
- ✅ Protected routes

### What Is Broken / Incomplete
- 🔧 `ml.service.js` — file exists but is empty
- 🔧 `financialScore.js` — file exists but is empty
- 🔧 CORS is fully open (no origin restriction)
- 🔧 Auth routes have no Joi validation
- 🔧 Category normalization inconsistent (PascalCase in transactions, lowercase in budgets)
- 🔧 `recharts` in backend package.json (wrong location — frontend-only lib)
- 🔧 `Navbar.jsx` imported/exists but never used in routing

### What Is Missing
- ❌ Refresh token system
- ❌ Budget update/delete
- ❌ User profile/settings
- ❌ Transaction search
- ❌ Transaction export (CSV/PDF)
- ❌ Savings goals
- ❌ Recurring transactions
- ❌ Budget alerts
- ❌ Monthly reports
- ❌ AI financial assistant
- ❌ Android app (Capacitor)
- ❌ SMS auto-detection
- ❌ i18n (12 languages)
- ❌ Multi-currency
- ❌ Redis caching
- ❌ WebSocket
- ❌ Docker / CI/CD
- ❌ SEO / PWA
- ❌ Monetization

---

## Phase 0 — Documentation (✅ Complete)

**Deliverables:**
- [x] `PROJECT_FULL_ARCHITECTURE.md`
- [x] `IMPLEMENTATION_ROADMAP.md`

---

## Phase 1 — Core Completion (🔴 Critical)

> Complete existing functionality, fix security issues, add missing core features.  
> **Do NOT add AI/Android/i18n here — foundation first.**

### 1.1 — Security Fixes 🔴

**Complexity**: Low | **Dependencies**: None | **Priority**: HIGHEST

#### Backend
- [ ] Fix CORS: `cors({ origin: process.env.CLIENT_URL, credentials: true })`
- [ ] Add Joi validation to auth routes (register + login schemas)
- [ ] Remove `recharts` from backend `package.json`
- [ ] Normalize category to PascalCase in both transaction AND budget controllers/services
- [ ] Add `express-mongo-sanitize` to prevent NoSQL injection
- [ ] Improve error messages (don't expose stack traces in production)

**Files to modify:**
- `finance-backend/src/app.js` — CORS fix
- `finance-backend/src/routes/auth.routes.js` — add validation middleware
- `finance-backend/src/validations/` — add `auth.validator.js`
- `finance-backend/src/services/budget.service.js` — normalize category
- `finance-backend/package.json` — remove recharts

---

### 1.2 — Refresh Token System 🔴

**Complexity**: Medium | **Dependencies**: 1.1 | **Priority**: HIGH

#### Backend
- [ ] Create `RefreshToken` Mongoose model (hashed token, user ref, device, expiresAt, TTL index)
- [ ] `POST /api/auth/refresh` — validate refresh token → issue new access token (15min) + rotate refresh token
- [ ] `POST /api/auth/logout` — delete refresh token from DB + clear cookie
- [ ] Update login response: short JWT (15min) in body + refresh token in httpOnly cookie
- [ ] Update `auth.middleware.js` to handle 15min tokens

#### Frontend
- [ ] Update `AuthContext.jsx` — remove localStorage token, store in memory (React state)
- [ ] Update `axios.js` — add response interceptor: on 401 → call /auth/refresh → retry original request → on failure → logout
- [ ] Update `ProtectedRoute.jsx` — check AuthContext user state (not localStorage)

**Files to create:**
- `finance-backend/src/models/refreshToken.model.js`

**Files to modify:**
- `finance-backend/src/services/auth.service.js`
- `finance-backend/src/controllers/auth.controller.js`
- `finance-backend/src/routes/auth.routes.js`
- `finance-frontend/src/context/AuthContext.jsx`
- `finance-frontend/src/api/axios.js`
- `finance-frontend/src/routes/ProtectedRoute.jsx`

---

### 1.3 — Budget CRUD Completion 🔴

**Complexity**: Low | **Dependencies**: None | **Priority**: HIGH

#### Backend
- [ ] `PUT /api/budgets/:id` — update limitAmount, alertThreshold (with user ownership check)
- [ ] `DELETE /api/budgets/:id` — delete (with user ownership check)
- [ ] Add unique compound index: `{user, category, month, year}` (prevent duplicate budgets)
- [ ] Add `alertThreshold` field to Budget model

#### Frontend
- [ ] Budget management page (`/budgets`) — list all budgets
- [ ] Edit budget modal — change limit amount
- [ ] Delete budget with confirmation
- [ ] Budget progress bars showing usage % with alert colors

**Files to create:**
- `finance-frontend/src/pages/BudgetsPage.jsx`
- `finance-frontend/src/hooks/useBudgets.js`
- `finance-frontend/src/hooks/useCreateBudget.js`
- `finance-frontend/src/hooks/useUpdateBudget.js`
- `finance-frontend/src/hooks/useDeleteBudget.js`

**Files to modify:**
- `finance-backend/src/routes/budget.routes.js`
- `finance-backend/src/controllers/budget.controller.js`
- `finance-backend/src/services/budget.service.js`
- `finance-backend/src/models/budget.model.js`
- `finance-frontend/src/App.jsx` — add /budgets route
- `finance-frontend/src/components/layout/Sidebar.jsx` — add Budgets nav link

---

### 1.4 — User Profile & Settings 🟡

**Complexity**: Low | **Dependencies**: 1.1 | **Priority**: HIGH

#### Backend
- [ ] `GET /api/users/profile` — return user data (no password)
- [ ] `PUT /api/users/profile` — update name, monthlyIncome, preferredCurrency, preferredLanguage
- [ ] `PUT /api/users/change-password` — verify old password, hash new password
- [ ] Add `tier`, `preferredCurrency`, `preferredLanguage`, `avatarUrl`, `lastLogin` to User model

#### Frontend
- [ ] Settings page (`/settings`) — profile form, change password section
- [ ] Profile avatar display in Header and Sidebar
- [ ] Monthly income field in profile (used for savings rate calculation)

**Files to create:**
- `finance-backend/src/routes/user.routes.js`
- `finance-backend/src/controllers/user.controller.js`
- `finance-backend/src/services/user.service.js`
- `finance-backend/src/validations/user.validator.js`
- `finance-frontend/src/pages/SettingsPage.jsx`
- `finance-frontend/src/hooks/useProfile.js`
- `finance-frontend/src/hooks/useUpdateProfile.js`

**Files to modify:**
- `finance-backend/src/app.js` — register user routes
- `finance-backend/src/models/user.model.js` — add new fields
- `finance-frontend/src/App.jsx` — add /settings route
- `finance-frontend/src/components/layout/Sidebar.jsx` — add Settings nav

---

### 1.5 — Transaction Search & Export 🟡

**Complexity**: Medium | **Dependencies**: None | **Priority**: MEDIUM

#### Backend
- [ ] Add `search` query param to `GET /api/transactions` — search description + category (text index or regex)
- [ ] `GET /api/transactions/export` — returns CSV (query same filters as list)
- [ ] Add MongoDB text index on `{description, category}` for full-text search

#### Frontend
- [ ] Search bar in TransactionsPage
- [ ] Export button → download CSV
- [ ] Debounced search input (300ms)

**Files to modify:**
- `finance-backend/src/services/transaction.service.js` — add search + export logic
- `finance-backend/src/routes/transaction.routes.js` — add /export route
- `finance-backend/src/controllers/transaction.controller.js` — add exportTransactions
- `finance-frontend/src/pages/TransactionsPage.jsx`
- `finance-frontend/src/components/TransactionFilters.jsx`

---

### 1.6 — Financial Score Engine 🟡

**Complexity**: Medium | **Dependencies**: None | **Priority**: MEDIUM

#### Backend
- [ ] Implement `financialScore.js` utility:
  - Savings rate score (25 pts): `(income - expense) / income × 100`
  - Budget adherence score (25 pts): ratio of categories within budget
  - Expense consistency score (20 pts): low month-to-month variance
  - Debt/EMI ratio score (15 pts): EMI category transactions vs income
  - Emergency fund score (15 pts): savings ≥ 3× monthly expenses
- [ ] `GET /api/users/financial-score` — calculate and return score with breakdown
- [ ] Cache score in Redis (TTL: 1 hour) — recalculate on transaction create/delete

**Files to modify:**
- `finance-backend/src/utils/financialScore.js` — implement algorithm
- `finance-backend/src/routes/user.routes.js` — add /financial-score endpoint
- `finance-backend/src/controllers/user.controller.js`

#### Frontend
- [ ] Financial score card on Dashboard — circular progress indicator
- [ ] Score breakdown on Settings/Profile page

---

### 1.7 — Savings Goals 🟡

**Complexity**: Medium | **Dependencies**: 1.4 | **Priority**: MEDIUM

#### Backend
- [ ] Create `SavingsGoal` model: name, targetAmount, savedAmount, deadline, isCompleted, user
- [ ] Full CRUD: POST/GET/PUT/DELETE `/api/goals`
- [ ] Progress calculation endpoint
- [ ] Auto-mark completed when savedAmount ≥ targetAmount

#### Frontend
- [ ] Goals page (`/goals`) with progress cards
- [ ] Create/edit goal modal
- [ ] Contribution: "Add savings" button to update savedAmount
- [ ] Visual progress bars and deadline countdown

**Files to create:**
- `finance-backend/src/models/goal.model.js`
- `finance-backend/src/routes/goal.routes.js`
- `finance-backend/src/controllers/goal.controller.js`
- `finance-backend/src/services/goal.service.js`
- `finance-frontend/src/pages/GoalsPage.jsx`
- `finance-frontend/src/hooks/useGoals.js`

---

### 1.8 — Recurring Transactions 🟡

**Complexity**: Medium | **Dependencies**: 1.4 | **Priority**: MEDIUM

#### Backend
- [ ] Create `RecurringTransaction` model: type, category, amount, frequency, nextRunDate, isActive
- [ ] CRUD endpoints: POST/GET/PUT/DELETE `/api/recurring`
- [ ] Background job (Agenda.js) to create transactions from recurring on nextRunDate
- [ ] `source: 'recurring'` field on generated transactions

#### Frontend
- [ ] Recurring transactions section in Transactions page or separate page
- [ ] Create/edit recurring transaction form
- [ ] Toggle active/inactive
- [ ] Show next run date

**Files to create:**
- `finance-backend/src/models/recurringTransaction.model.js`
- `finance-backend/src/routes/recurring.routes.js`
- `finance-backend/src/controllers/recurring.controller.js`
- `finance-backend/src/services/recurring.service.js`
- `finance-backend/src/jobs/recurringProcessor.job.js`

---

### 1.9 — Budget Alerts 🟡

**Complexity**: Low | **Dependencies**: 1.3 | **Priority**: MEDIUM

#### Backend
- [ ] Check budget alert threshold on every transaction creation
- [ ] Return `budgetWarnings: []` array in create transaction response when threshold crossed
- [ ] Alert threshold configurable per budget (default 80%)

#### Frontend
- [ ] Toast warning when transaction pushes category spending over threshold
- [ ] Red/orange progress bars on Budget page when over 80%/100%
- [ ] Dashboard budget alert banner when any category exceeded

---

### 1.10 — Monthly Reports 🟡

**Complexity**: Medium | **Dependencies**: 1.6 | **Priority**: MEDIUM

#### Backend
- [ ] `GET /api/reports/monthly?month=X&year=Y` — comprehensive monthly summary:
  - Income, expense, savings totals
  - Category breakdown with budget comparison
  - Top 5 transactions
  - Month-over-month comparison
  - Financial score for the month
  - Saving rate vs previous month

#### Frontend
- [ ] Reports page (`/reports`) with monthly/yearly selector
- [ ] Printable / exportable report view
- [ ] Charts embedded in report

---

## Phase 2 — AI Financial Assistant (🟡 High Value)

> Implement intelligent financial guidance using LLM APIs.

**Complexity**: High | **Dependencies**: Phase 1 complete | **Priority**: HIGH

### 2.1 — ML Service Implementation

- [ ] LLM abstraction layer (supports Claude + OpenAI, switchable via env var)
- [ ] `FinancialAnalyzer` class — spending pattern analysis
- [ ] `RecommendationEngine` class — personalized advice
- [ ] `ChatAssistant` class — conversational interface
- [ ] Prompt management module (`src/prompts/`)
- [ ] Token cost tracking (log token usage per request)

**Files to create:**
- `finance-backend/src/services/ml.service.js` — full implementation
- `finance-backend/src/prompts/system-prompt.js`
- `finance-backend/src/prompts/analysis.js`
- `finance-backend/src/prompts/recommendations.js`
- `finance-backend/src/prompts/chat.js`

### 2.2 — Financial Score (AI-enhanced)

- [ ] Enhance `financialScore.js` with AI narrative explanation
- [ ] `GET /api/ai/score` — score + plain-English explanation
- [ ] Personalized recommendations based on score

### 2.3 — AI API Routes

- [ ] `POST /api/ai/chat` — conversational assistant (streaming response)
- [ ] `GET /api/ai/score` — financial health score with AI narrative
- [ ] `GET /api/ai/recommendations` — top 5 personalized recommendations
- [ ] `GET /api/ai/predict` — next month spending forecast
- [ ] `GET /api/ai/subscriptions` — detected recurring subscriptions
- [ ] Rate limiting: 20 AI requests/hour (free tier), 200/hour (premium)
- [ ] Tier gate middleware — AI routes require `premium` tier (or trial credits)

**Files to create:**
- `finance-backend/src/routes/ai.routes.js`
- `finance-backend/src/controllers/ai.controller.js`
- `finance-backend/src/middlewares/tierGate.middleware.js`

### 2.4 — Background AI Jobs

- [ ] `monthly-analysis` job — run on 1st of month, cache insights
- [ ] `anomaly-detection` job — nightly, detect unusual spending
- [ ] `weekly-insights` job — Sunday, push insights to frontend

**Files to create:**
- `finance-backend/src/config/agenda.js`
- `finance-backend/src/jobs/monthlyAnalysis.job.js`
- `finance-backend/src/jobs/anomalyDetection.job.js`

### 2.5 — AI Frontend UI

- [ ] AI Assistant chat page (`/ai-assistant`)
- [ ] Floating AI chat button (bottom-right) on all pages
- [ ] Financial score widget on Dashboard
- [ ] Recommendations carousel on Dashboard
- [ ] Subscription detection alerts
- [ ] Spending anomaly notifications

**Files to create:**
- `finance-frontend/src/pages/AIAssistantPage.jsx`
- `finance-frontend/src/components/ai/ChatInterface.jsx`
- `finance-frontend/src/components/ai/MessageBubble.jsx`
- `finance-frontend/src/components/ai/FinancialScoreCard.jsx`
- `finance-frontend/src/components/ai/RecommendationCard.jsx`
- `finance-frontend/src/hooks/useAIChat.js`
- `finance-frontend/src/hooks/useFinancialScore.js`

---

## Phase 3 — Android App + SMS Automation (🟡 High Value)

> Production-ready Android app with intelligent SMS finance parsing.

**Complexity**: High | **Dependencies**: Phase 1 + 2 complete | **Priority**: HIGH

### 3.1 — Capacitor Setup

- [ ] `npm install @capacitor/core @capacitor/cli` in finance-frontend
- [ ] `npx cap init` — app ID: `com.financemanager.app`
- [ ] `npm install @capacitor/android`
- [ ] `npx cap add android`
- [ ] Configure Vite build output for Capacitor
- [ ] `npx cap sync` after each build

**Files to create:**
- `finance-frontend/capacitor.config.ts`
- `finance-frontend/android/` (generated)

### 3.2 — Native SMS Plugin

- [ ] Custom Capacitor plugin for SMS read permission
- [ ] SMS listener (background service)
- [ ] Permission request UI flow
- [ ] Sender whitelist (known bank numbers, VPA addresses)

**Files to create:**
- `finance-frontend/src/plugins/SmsPlugin.ts`
- Android native Java bridge code

### 3.3 — SMS Parser Service

- [ ] Regex-based parser (fast, free, handles 90% of cases)
- [ ] LLM fallback for ambiguous messages (Claude Haiku — cheap)
- [ ] Category mapping table (50+ merchants/patterns)
- [ ] Deduplication by hash (amount + date + sender)

**Files to create:**
- `finance-frontend/src/services/smsParser.service.ts`
- `finance-frontend/src/services/smsSync.service.ts`
- `finance-backend/src/prompts/sms-parser.js`

### 3.4 — Offline Sync

- [ ] IndexedDB queue for pending SMS transactions
- [ ] Background sync on connectivity restore
- [ ] Conflict resolution (server wins on same-day duplicates)
- [ ] Retry with exponential backoff
- [ ] Sync status indicator in UI

### 3.5 — Android-specific UI

- [ ] SMS permission onboarding screen
- [ ] SMS transaction review list (before syncing)
- [ ] Background sync status notification
- [ ] Biometric authentication option

---

## Phase 4 — Internationalization (🟢 Enhancement)

> Full i18n support for 12 languages with RTL.

**Complexity**: Medium | **Dependencies**: Phase 1 complete | **Priority**: MEDIUM

### Setup
- [ ] `npm install react-i18next i18next i18next-browser-languagedetector`
- [ ] i18n configuration file (`src/i18n/index.js`)
- [ ] Language switcher component
- [ ] Language stored in user profile (backend) + localStorage (offline)

### Translation Files
- [ ] English (`en.json`) — source of truth
- [ ] Hindi (`hi.json`)
- [ ] Tamil (`ta.json`)
- [ ] Malayalam (`ml.json`)
- [ ] Kannada (`kn.json`)
- [ ] Telugu (`te.json`)
- [ ] French (`fr.json`)
- [ ] German (`de.json`)
- [ ] Spanish (`es.json`)
- [ ] Arabic (`ar.json`) + RTL CSS (`dir="rtl"`)
- [ ] Japanese (`ja.json`)
- [ ] Chinese Simplified (`zh.json`)

### Localization Features
- [ ] Date formatting (locale-aware via `Intl.DateTimeFormat`)
- [ ] Number/currency formatting (locale-aware via `Intl.NumberFormat`)
- [ ] RTL layout support (Tailwind RTL plugin)
- [ ] Auto-detect browser language on first visit

---

## Phase 5 — Multi-Currency Support (🟢 Enhancement)

> Global currency support with live exchange rates.

**Complexity**: Medium | **Dependencies**: Phase 1 + 4 complete | **Priority**: MEDIUM

### Backend
- [ ] Add `preferredCurrency` to User model (already planned in 1.4)
- [ ] Currency conversion service using Open Exchange Rates API (free tier)
- [ ] Cache exchange rates in Redis (TTL: 1 hour)
- [ ] `GET /api/currency/rates` — current rates
- [ ] Store `originalAmount` + `originalCurrency` on transactions
- [ ] Convert to user's preferred currency for aggregations

### Frontend
- [ ] `CurrencyContext` — selected currency, exchange rates
- [ ] Currency selector in Settings
- [ ] Format all amounts using `Intl.NumberFormat`
- [ ] Support: INR, USD, EUR, GBP, JPY, AED, SAR, CAD, AUD, SGD, CHF, + all ISO 4217

---

## Phase 6 — Performance & Scalability (🟡 Important)

> Production-ready performance for high traffic.

**Complexity**: High | **Dependencies**: Phase 1 complete | **Priority**: HIGH (for launch)

### 6.1 — Redis Caching

- [ ] Install `ioredis` in backend
- [ ] Redis config module
- [ ] Cache middleware (generic TTL-based cache)
- [ ] Cache dashboard summaries (5min TTL, per-user key)
- [ ] Cache financial score (60min TTL)
- [ ] Cache exchange rates (60min TTL)
- [ ] Cache invalidation on transaction mutations

### 6.2 — API Consolidation

- [ ] `GET /api/dashboard?period=X` — single endpoint returning all dashboard data
  - Uses MongoDB `$facet` for parallel aggregations
  - 1 DB round-trip instead of 3
- [ ] Update frontend Dashboard to use single query

### 6.3 — Frontend Performance

- [ ] Route-level code splitting (`React.lazy` + `Suspense`)
- [ ] Set sensible `staleTime` on all React Query configs (30s dashboard, 60s budgets)
- [ ] Debounce search input (already planned in 1.5)
- [ ] Virtual list for long transaction lists (`react-window`)
- [ ] Image lazy loading for future receipt uploads

### 6.4 — DB Optimization

- [ ] Add compound index: `{user, type, category, transactionDate}` (covering index for category-summary)
- [ ] Add text index: `{description, category}` for search
- [ ] Add TTL index: `{expiresAt}` on RefreshTokens
- [ ] Mongoose connection pool: `maxPoolSize: 50`
- [ ] Explain plan analysis on heavy aggregations

### 6.5 — WebSocket (Real-time)

- [ ] `socket.io` integration for live dashboard updates
- [ ] Emit events: `transaction:created`, `transaction:deleted`, `budget:alert`
- [ ] Frontend React Query invalidation on WebSocket events
- [ ] SMS sync status push from Android → web dashboard

### 6.6 — Background Jobs

- [ ] Agenda.js setup
- [ ] Recurring transaction processor (daily at 6am)
- [ ] Monthly report generator (1st of month)
- [ ] Budget alert checker (on transaction write)
- [ ] Exchange rate updater (hourly)

---

## Phase 7 — SEO + PWA (🟢 Enhancement)

**Complexity**: Medium | **Dependencies**: Phase 6 complete | **Priority**: MEDIUM

### SEO
- [ ] `npm install react-helmet-async`
- [ ] Per-route meta tags (title, description, OG tags)
- [ ] Landing page (public, not behind auth)
- [ ] Pricing page (public)
- [ ] Blog/tips section (financial content for SEO traffic)
- [ ] `robots.txt` (disallow /dashboard, /transactions, /api)
- [ ] `sitemap.xml` (public pages only)
- [ ] Structured data (SoftwareApplication JSON-LD)
- [ ] Canonical URLs

### PWA
- [ ] `vite-plugin-pwa` setup
- [ ] `manifest.json` (name, icons, theme color)
- [ ] Service worker (offline support for dashboard)
- [ ] Cache strategies:
  - Shell: CacheFirst
  - API responses: StaleWhileRevalidate
  - Images: CacheFirst with expiry
- [ ] Install prompt

### Performance (Lighthouse 95+)
- [ ] Preload critical fonts
- [ ] Optimize bundle size (tree shaking, code splitting)
- [ ] Compress assets (gzip/brotli in Nginx)
- [ ] Lazy load below-fold components

---

## Phase 8 — Monetization (🟢 Enhancement)

**Complexity**: Medium | **Dependencies**: Phase 1 + auth complete | **Priority**: MEDIUM

### Subscription System
- [ ] Add `tier: { type: String, enum: ['free', 'premium'], default: 'free' }` to User model (planned in 1.4)
- [ ] `tierGate.middleware.js` — blocks premium features for free users with 403 + upgrade prompt
- [ ] `POST /api/payments/create-subscription` — Razorpay (India) + Stripe (global)
- [ ] `POST /api/payments/webhook` — handle payment success/failure → update user tier
- [ ] Subscription management: `GET /api/payments/subscription`, cancel endpoint
- [ ] Trial credits: 10 free AI requests for new users

### Feature Gating
- [ ] AI chat → premium only
- [ ] Financial score → premium only  
- [ ] Recurring transactions → premium only
- [ ] Multi-currency → premium only
- [ ] Unlimited budgets → premium only (free: 3 max)
- [ ] Unlimited goals → premium only (free: 1 max)

### Ad Integration
- [ ] Google AdSense script (loaded only for free-tier users)
- [ ] Ad slots: dashboard footer, transaction list bottom
- [ ] AdMob for Android (free tier)
- [ ] No ads shown to premium users
- [ ] Consent management (GDPR/privacy banner)

---

## Phase 9 — DevOps (🟡 Important)

**Complexity**: Medium | **Dependencies**: All phases complete | **Priority**: HIGH (for production)

### Docker
- [ ] `finance-backend/Dockerfile` — Node.js multi-stage build
- [ ] `finance-frontend/Dockerfile` — Vite build → Nginx serve
- [ ] `docker-compose.yml` — backend + frontend + MongoDB + Redis + worker
- [ ] `.dockerignore` for both services
- [ ] Environment-specific configs (dev/staging/prod)

### CI/CD (GitHub Actions)
- [ ] `.github/workflows/ci.yml`:
  - Lint (eslint)
  - Build (both services)
  - Test (jest)
  - Security scan (npm audit)
- [ ] `.github/workflows/deploy.yml`:
  - Build Docker images
  - Push to Docker Hub / ECR
  - Deploy to staging on PR merge to `develop`
  - Deploy to production on PR merge to `main`

### Health Checks & Monitoring
- [ ] `GET /health` endpoint → `{ status: 'ok', db: 'connected', redis: 'connected', uptime }`
- [ ] `GET /ready` endpoint → readiness probe
- [ ] PM2 ecosystem file (`ecosystem.config.js`) — cluster mode, auto-restart
- [ ] Sentry integration for error tracking (frontend + backend)
- [ ] Log rotation (Winston + logrotate)
- [ ] Uptime monitoring (UptimeRobot or similar)

### Environments
```
development  → local Node + MongoDB Atlas + no Redis
staging      → Docker compose on dev server
production   → Nginx + PM2 cluster + MongoDB Atlas M30 + Redis Cloud + CDN
```

---

## Dependency Map

```
Phase 0 (Docs)
  └─ Phase 1 (Core)
       ├─ Phase 1.1 Security  ←─ everything depends on this
       ├─ Phase 1.2 Auth      ←─ 1.1 first
       ├─ Phase 1.3 Budgets   ←─ independent
       ├─ Phase 1.4 Profile   ←─ 1.1 first
       ├─ Phase 1.5 Search    ←─ independent
       ├─ Phase 1.6 Score     ←─ independent
       ├─ Phase 1.7 Goals     ←─ 1.4 (user prefs)
       ├─ Phase 1.8 Recurring ←─ 1.4
       ├─ Phase 1.9 Alerts    ←─ 1.3
       └─ Phase 1.10 Reports  ←─ 1.6
  └─ Phase 2 (AI)             ←─ Phase 1 recommended
  └─ Phase 3 (Android)        ←─ Phase 1 + 2
  └─ Phase 4 (i18n)           ←─ Phase 1
  └─ Phase 5 (Currency)       ←─ Phase 1 + 4
  └─ Phase 6 (Performance)    ←─ Phase 1
  └─ Phase 7 (SEO/PWA)        ←─ Phase 6
  └─ Phase 8 (Monetization)   ←─ Phase 1 + 2
  └─ Phase 9 (DevOps)         ←─ All phases
```

---

## Complexity Estimates

| Phase | Scope | Effort |
|-------|-------|--------|
| 0 — Docs | Small | 1 session |
| 1 — Core completion | Large | 3–4 sessions |
| 2 — AI Assistant | Large | 2–3 sessions |
| 3 — Android + SMS | X-Large | 3–5 sessions |
| 4 — i18n | Medium | 1–2 sessions |
| 5 — Multi-currency | Medium | 1 session |
| 6 — Performance | Medium | 1–2 sessions |
| 7 — SEO + PWA | Medium | 1 session |
| 8 — Monetization | Large | 2–3 sessions |
| 9 — DevOps | Medium | 1–2 sessions |

---

## Commit Strategy

Each meaningful unit of work gets its own commit:

```
feat(auth): add Joi validation to register and login routes
fix(cors): restrict origin to CLIENT_URL env variable
feat(budgets): add PUT and DELETE endpoints with ownership check
feat(profile): add user profile GET/PUT and change-password endpoints
feat(export): add CSV export endpoint for transactions
feat(goals): add savings goals CRUD
feat(recurring): add recurring transactions with background processor
feat(score): implement financial health score algorithm
feat(ai): implement ml.service.js with LLM abstraction layer
feat(android): add Capacitor setup and SMS parser service
feat(i18n): add react-i18next with 12 languages
feat(currency): add multi-currency support with exchange rates
feat(redis): add Redis caching for dashboard and score endpoints
feat(pwa): add PWA manifest, service worker, SEO meta tags
feat(monetization): add subscription model with Stripe/Razorpay
feat(devops): add Docker, docker-compose, GitHub Actions CI/CD
```
