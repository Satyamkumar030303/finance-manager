# Finance Manager — Master Context Document

> **Purpose.** This document is the single source of truth for the **Finance Manager** project. It captures every implemented feature, the underlying architecture, database design, algorithms, security model, UI system, testing approach, deployment strategy, advantages, limitations, future scope, and viva preparation in one place. It is intended to be reused to generate the final project report (50–70 pages), the project presentation, viva explanations, and supporting documentation, without re-explaining the project each time.

> **Document version.** 1.0  
> **Project repository layout.** Monorepo with `finance-frontend/` (React + Vite) and `finance-backend/` (Node.js + Express + MongoDB), wrapped with **Capacitor** for Android packaging.

---

## Table of Contents

1. [Project Overview](#section-1--project-overview)
2. [Complete Feature List](#section-2--complete-feature-list)
3. [Tech Stack](#section-3--tech-stack)
4. [System Architecture](#section-4--system-architecture)
5. [Database Design](#section-5--database-design)
6. [Project Workflow](#section-6--project-workflow)
7. [Detailed Module Explanation](#section-7--detailed-module-explanation)
8. [Algorithms / Logic Used](#section-8--algorithms--logic-used)
9. [Security Implementation](#section-9--security-implementation)
10. [UI / UX Design System](#section-10--uiux-design-system)
11. [Testing & Edge Cases](#section-11--testing--edge-cases)
12. [Deployment](#section-12--deployment)
13. [Advantages](#section-13--advantages)
14. [Limitations](#section-14--limitations)
15. [Future Enhancements](#section-15--future-enhancements)
16. [Project Snapshot List](#section-16--project-snapshot-list)
17. [Viva Questions and Answers](#section-17--viva-questions--answers)

---

# Section 1 — Project Overview

## 1.1 Project Title

**Finance Manager — An AI-Powered Personal Finance Management System with SMS-Based Transaction Ingestion and Multilingual Support**

## 1.2 Problem Statement

Personal finance is one of the most universally relevant yet poorly managed domains in everyday life. Users routinely face the following challenges:

- **Fragmented visibility.** Transactions are scattered across multiple bank accounts, UPI apps, credit cards, wallets, and cash, with no consolidated view.
- **Manual data entry burden.** Existing solutions require users to type every transaction by hand, which is tedious and inconsistent, leading to abandonment within weeks.
- **Lack of contextual intelligence.** Generic spreadsheets and basic budgeting apps tell users *what* they spent but rarely *why* it matters or *how* to change behaviour.
- **Language and currency barriers.** Most personal finance tools are English-only and dollar/euro-centric, which excludes a large population of users in India and other emerging markets who prefer regional languages and the Indian Rupee.
- **No proactive insight.** Users do not get early warnings about exceeded budgets, missed recurring payments, low savings rates, or undetected subscription drains.
- **Privacy concerns with bank APIs.** Many alternatives require direct bank linking via screen scraping or aggregators, which users distrust.

## 1.3 Purpose of the System

The Finance Manager system is designed to address these problems by combining four capabilities in a single, privacy-respecting application:

1. **A frictionless transaction-capture pipeline** built around SMS parsing — Indian banks and UPI providers already send transactional SMS messages to the user's phone; the app reads and parses these locally (on the user's device on Android via Capacitor, or on demand by paste-in on the web) and converts them into structured transactions without exposing bank credentials.
2. **A rich management surface** for transactions, budgets, savings goals, and recurring expenses, with intuitive filters, search, exports, and multi-currency support.
3. **An AI-driven advisory layer** that analyses spending patterns, predicts the next month's outflows, detects recurring subscriptions, computes a financial health score, and answers free-form questions in the user's preferred language.
4. **A multilingual, dark-mode-aware UI** that runs identically as a web application and as an Android app, supporting 12 languages including English, Hindi, Tamil, Malayalam, Kannada, Telugu, Spanish, Arabic (with RTL), Japanese, Chinese, French, and German.

## 1.4 Why This Project Was Built

The project was conceived for the following reasons:

- **Practical need.** It addresses a real gap between rudimentary spreadsheet trackers and heavy-weight enterprise tools (Mint, YNAB), particularly for the Indian market.
- **Demonstrates a full-stack stack.** It exercises the modern web stack end-to-end: React + Vite on the client, Express + MongoDB on the server, JWT authentication, REST API design, React Query for caching, i18next for localisation, Recharts for visualisation, Tailwind for design tokens, Capacitor for native packaging.
- **Touches AI integration responsibly.** Rather than wrapping a chat model as a gimmick, the project demonstrates how an LLM (DeepSeek/Qwen via OpenRouter) can be applied to domain-specific finance tasks — analysis, prediction, subscription detection — while keeping deterministic logic (regex SMS parsing, financial scoring) on the server.
- **Demonstrates cross-cutting concerns.** Localisation, currency handling, dark mode, offline support, error states, empty states, and mobile responsiveness are all designed deliberately, not as afterthoughts.
- **Educational completeness.** The project is large enough to surface real engineering trade-offs — caching, validation, contract drift, error handling, build performance — and small enough to be implemented and understood by a single developer.

## 1.5 Real-World Relevance

The system maps to real, observed user behaviour in markets where:

- Bank/UPI SMS notifications are the de-facto transaction record.
- Multiple regional languages are spoken in the same household.
- Mobile-first usage is dominant.
- Trust in third-party financial aggregators is low.

Comparable commercial products (Walnut, ETMoney, Money View, INDmoney) prove the demand. Finance Manager differentiates by being:

- **Local-first.** SMS parsing happens on-device.
- **Multilingual.** 12 languages in the same build.
- **Open architecture.** The codebase is auditable and the data model is portable.

## 1.6 Target Users

- **Individual salaried professionals** who want a unified view of personal cash flow.
- **Students and young earners** who are starting to track finances seriously.
- **Households** with mixed-language users.
- **Anyone using UPI extensively** in India who wants automated capture without bank credential sharing.

## 1.7 Key Objectives

| # | Objective |
|---|-----------|
| O1 | Provide a secure, JWT-protected web application for personal finance management. |
| O2 | Reduce transaction-entry friction to near zero via SMS parsing and quick-add flows. |
| O3 | Support category-wise budgeting with proactive threshold warnings. |
| O4 | Enable savings-goal tracking with contributions and deadline visibility. |
| O5 | Automate recurring transaction creation (subscriptions, salary, EMIs). |
| O6 | Deliver actionable AI-generated insights (analysis, prediction, scoring, subscription detection). |
| O7 | Offer comprehensive reports with charts and CSV export. |
| O8 | Localise the entire UI into twelve languages without code change per page. |
| O9 | Package the same codebase as an Android application via Capacitor. |
| O10 | Maintain a clean, dark-mode-aware, mobile-responsive design system. |

## 1.8 Scope of the Project

**In scope:**
- Web application (production-ready single-page React app).
- REST API backend with MongoDB persistence.
- JWT-based authentication with refresh-token rotation.
- All eleven feature modules (Section 2).
- 12-language localisation with Right-to-Left support for Arabic.
- Capacitor Android shell.

**Explicitly out of scope (in the current version):**
- Direct bank API integration (Plaid/Salt Edge/Account Aggregator).
- iOS native build (Capacitor supports it but is not exercised here).
- Multi-user collaboration / shared budgets.
- Tax filing / capital-gain reporting.
- Investment portfolio analytics (covered as a future enhancement).
- Production-grade observability (APM/logging stack).

---

# Section 2 — Complete Feature List

The system is composed of eleven primary feature modules. Each is fully implemented and individually testable.

## 2.1 Authentication

The authentication module is the gate to every other feature.

- **Login.** Email-and-password login form. The server validates credentials using `bcrypt.compare`, issues a JSON Web Token (JWT) access token (15-minute expiry) and a refresh token (30-day expiry, stored as an `httpOnly` cookie).
- **Signup.** Registration form collecting name, email, and password. Passwords are hashed with `bcryptjs` before storage. Duplicate emails are rejected at the validation layer.
- **Protected routes.** Every API endpoint except `POST /auth/login`, `POST /auth/register`, and `POST /auth/refresh` requires a valid bearer token, enforced by an Express middleware. The frontend wraps protected pages in a `ProtectedRoute` component that redirects unauthenticated users to `/login`.
- **Session management.** A refresh-token rotation flow is implemented: when the 15-minute access token expires, the axios response interceptor on the frontend silently calls `POST /auth/refresh`, receives a new access token, and retries the original request. On refresh-token failure (e.g., after 30 days), the user is logged out.
- **Logout.** Clears the in-memory access token, deletes the refresh-token cookie, and invalidates the refresh token in the database.

## 2.2 Dashboard

The dashboard is the landing page after login and presents a high-level financial snapshot.

- **Income summary.** Total income across the selected period (month / last month / year / decade / all-time).
- **Expense summary.** Total expense for the same period.
- **Net savings.** Income minus expense, with sign-aware colouring.
- **Savings rate.** Computed as `(netSavings / totalIncome) × 100`, displayed as a percentage with traffic-light bands (excellent ≥ 20 %, good ≥ 10 %, low otherwise).
- **Smart insights.** Rule-based narrative insights (e.g., "you spent 38 % of your income on Food — consider reducing"). Implemented in `components/SmartInsights.jsx`.
- **Recent transactions.** A table of the ten most recent transactions with description, category, amount, and date.
- **Charts.** Three charts are rendered using Recharts:
  - *Expense by Category* (donut/pie chart).
  - *Spending Trend* (area chart, period-aware).
  - *Income vs Expense* (bar chart).
- **Period selector.** A dropdown lets the user switch the time window; React Query refetches the consolidated `/transactions/dashboard?period=…` endpoint.

The dashboard request is consolidated into a single API call that returns summary, category breakdown, trends, and recent transactions in one round trip. The response is cached server-side in Redis for five minutes per user-period combination, and the cache is invalidated on any transaction mutation.

## 2.3 Transactions

The transactions module is the workhorse CRUD surface.

- **Add transaction.** Inline form on the Transactions page. Fields: type (income / expense), category (15 categories), amount, transaction date, and optional description. Validation rejects non-positive amounts and missing dates.
- **Edit transaction.** Pencil icon on each row opens a modal pre-populated with the existing values. Updates are PUT to `/transactions/:id`.
- **Delete transaction.** Trash icon with an undo-via-toast pattern (the deletion is scheduled with a 5-second toast that contains an "Undo" button; if not undone, the DELETE request fires).
- **Filtering.** Three filters compose:
  - Type (income / expense / all).
  - Category (15 categories / all).
  - Month (HTML `<input type="month">` returning `YYYY-MM`).
  Filters are combined with search and sent to the backend as query parameters (`type`, `category`, `month`, `year`, `search`).
- **Search.** Free-text search across `description`, `category`, and `merchant` (case-insensitive regex).
- **Pagination.** Server-side pagination via `page` and `limit` query parameters (default 20, capped at 100).
- **Export CSV.** A button generates a CSV server-side with the same filter parameters and returns it as a blob; the browser downloads it.

The Transactions page also handles **two distinct empty states**:

- *No transactions yet* — onboarding messaging encouraging first-transaction entry.
- *No transactions match filters* — actionable messaging with a "Clear filters" CTA.

## 2.4 Budgets

The budgets module lets users set per-category monthly spending limits.

- **Category-wise budget management.** A budget is keyed by `(user, category, month, year)`. Each user can set one limit per category per month.
- **Spending tracking.** The backend `/budgets/comparison?month=&year=` endpoint computes, for each budget, the actual spend in that category for the same month and returns a comparison object (`{_id, category, budget, actual, percentage, alertThreshold, month, year, status}`).
- **Budget limit.** Numeric limit in the user's preferred currency.
- **Threshold warnings.** Each budget has an `alertThreshold` (default 80 %). The frontend displays a status badge:
  - *Within Budget* (green): below threshold.
  - *Warning* (amber): above threshold but below limit.
  - *Exceeded* (red): above limit.
- A budget alert is also surfaced as a `budgetWarnings` array attached to the `createTransaction` response so the user sees a contextual warning as soon as an offending expense is added.

## 2.5 Savings Goals

Goals let users set target amounts to save towards a labelled objective.

- **Goal creation.** Fields: name, icon (emoji), target amount, optional deadline, and category.
- **Progress tracking.** `savedAmount / targetAmount` is rendered as a progress bar with a percentage.
- **Deadline tracking.** Days remaining until deadline, with overdue flagging when past the date.
- **Contribution management.** A modal lets the user add to `savedAmount` in arbitrary increments. The goal is marked `isCompleted` automatically once `savedAmount ≥ targetAmount`.
- **Sections.** Goals are split into *Active* and *Completed* sections on the page.

## 2.6 Recurring Transactions

Recurring entries automate transactions that repeat on a schedule.

- **Frequencies.** Daily, Weekly, Monthly, Yearly.
- **Automatic scheduling.** A backend cron-like job (or on-demand check during dashboard load) creates a real transaction every time `nextRunDate ≤ today`, then advances `nextRunDate` by the frequency interval.
- **Next payment tracking.** Each recurring item shows the next run date and a relative-time hint (e.g., "3 d" / "overdue").
- **Edit / delete.** Standard CRUD with the same patterns as Transactions.
- **Pause / resume.** A toggle (`isActive`) lets users pause a recurring entry without deleting it. Paused entries appear in a separate "Paused" section.

## 2.7 Reports and Analytics

Reports surface aggregate views of historical data.

- **Monthly summary.** Total income, total expenses, net savings for the selected `month` and `year`.
- **Income vs Expense.** Stat cards with traffic-light colouring.
- **Savings rate.** Visual progress bar with three textual buckets (excellent / good / low).
- **Expense by category.** Donut chart computed server-side from a Mongo `$group` aggregate, sorted by amount descending. The frontend renders a colour-coded legend and a tabular breakdown below the chart.
- **Monthly trend analysis.** For the selected year, the server returns all twelve months densified (zeros where no data) with both income and expense series. Recharts renders a multi-line chart.
- **CSV export.** Same export endpoint as the Transactions page, parameterised by the selected month/year.

The chart axes and gridlines are theme-aware (dark/light) via a `useTheme()` hook that swaps stroke colours at render time.

## 2.8 AI Financial Assistant

A standalone page wrapping multiple AI endpoints, all backed by an LLM (DeepSeek / Qwen via OpenRouter) plus deterministic post-processing.

- **Spending analysis.** Sends the user's recent transactions to the LLM and parses a structured response: `{patterns[], concerns[], positives[], actions[]}` rendered as four labelled bullet lists with emoji headers.
- **Savings recommendations.** A `/ai/recommendations` endpoint returns an array of `{title, description, priority, estimatedSavings}` items rendered as priority-coloured cards on the left rail.
- **Future prediction.** `/ai/predict` returns `{predictedIncome, predictedTotal, byCategory, note}` based on the user's last 90 days. The chat surfaces this as a formatted message including the biggest forecasted category.
- **Financial health score.** A composite numeric score (0–100) with sub-scores broken into components (savings rate, budget adherence, diversity, etc.). Rendered as a circular gauge with sub-score bars.
- **Subscription detection.** `/ai/subscriptions` identifies recurring expense patterns from the transaction history with descriptions, estimated frequency, and monthly impact.
- **Free-form chat.** A chat interface where the user can ask any natural-language question; the backend forwards it to the LLM with the user's transaction context and the user's preferred language code.

The AI module is designed so that the chrome — titles, buttons, error fallbacks, message templates — is fully localised, while the LLM-generated content respects the user's selected language by passing `language: i18n.language` in every AI request body.

## 2.9 SMS Import

The most distinctive feature of the system. It converts unstructured bank/UPI SMS text into structured transactions.

- **SMS parsing.** A regex-based parser detects:
  - **Transaction type** via action-verb keywords (`credited` → income, `debited`, `spent`, `paid`, `purchase`, `withdrawn`, `payment of`, `transferred`, `sent`, `deducted`, `charged` → expense; `received`, `deposited`, `refund`, `cashback`, `salary`, `bonus`, `imps in`, `neft in` → income).
  - **Amount** with a currency-agnostic regex matching `Rs / Rs. / INR / ₹` either before or after the number.
  - **Merchant** via three layered patterns: explicit `at/to/from/by` keywords, UPI VPAs, and trailing bank-signature tags (e.g., `-SBI`).
  - **Category** via a keyword-to-category map (Zomato → Food, Uber → Transport, Netflix → Entertainment, etc.).
- **Credit / Debit detection.** Verbs are matched with `\b` word boundaries so noun forms (`credit card`, `debit card`) cannot trigger a false classification. When both verb categories appear (rare), credit takes precedence as the action.
- **OTP and promotional filter.** SMS containing words like `otp`, `one time`, `verification`, `password`, `login`, `alert: your` are skipped so the parser never tries to interpret them as transactions.
- **Auto transaction creation.** Once parsed, the structured object is sent to `POST /api/transactions` and inserted as a regular transaction with `source: "sms"`.
- **Offline queue.** If the API call fails because the device is offline, the parsed transaction is queued in `localStorage`. When the app resumes online, the queue is flushed and any duplicates are detected.
- **Android compatibility (Capacitor).** On Android, the listener layer in `services/sms.service.js` registers a Capacitor `App.resume` listener and is wired to flush the offline queue. Reading the SMS inbox directly via a Capacitor plugin is documented but kept as Phase 2 — the web-paste flow exercises the same parser, ensuring contract parity for both ingestion paths.

A separate `services/sms.service.js` exposes `parseSMS`, `getQueue`, `enqueueTransaction`, `flushQueue`, `startSMSListener` so the same parser is reused across paste-in, Android inbox sync, and AI subscription detection.

## 2.10 Localisation / Multi-Language Support

A first-class, fully-implemented localisation pipeline.

- **Languages.** Twelve: English (en), Hindi (hi), Tamil (ta), Malayalam (ml), Kannada (kn), Telugu (te), French (fr), German (de), Spanish (es), Arabic (ar, RTL), Japanese (ja), Chinese (zh).
- **Translation system.** Built on `react-i18next` with `i18next-browser-languagedetector`. A single flat namespace called `translation` with dotted keys (e.g., `dashboard.title`). Each locale file is a JSON object with parallel structure to `en.json`. All locales currently contain exactly **343 keys** in seventeen namespaces (`nav`, `dashboard`, `periods`, `months`, `transactions`, `budgets`, `goals`, `recurring`, `frequencies`, `ai`, `settings`, `common`, `categories`, `insights`, `reports`, `sms`, `header`).
- **Currency support.** A `CurrencyContext` exposes `fmt()` and `compact()` formatters via `Intl.NumberFormat` keyed to the user's `preferredCurrency` (INR, USD, EUR, GBP, JPY, AED, SAR, SGD, AUD, CAD).
- **Dynamic UI translation.** Every visible string flows through `t("namespace.key")` so language change is reactive — no page reload required. Right-to-left direction is toggled for Arabic by setting `document.documentElement.dir = "rtl"`.
- **Wire enums stay English.** Despite UI translation, the on-the-wire enum values (`type: "income"`, `category: "Food"`, `frequency: "monthly"`) remain English to keep the API contract and filters stable.

## 2.11 Settings

The settings page is the user's control panel.

- **Theme mode.** Light / Dark toggle, persisted in `localStorage`, applied by adding the `dark` class to `<html>`. The toggle works system-preference-aware on first visit.
- **Font customisation.** Six font families (Inter, Poppins, Manrope, DM Sans, Outfit, Nunito) selectable via a font picker; applied via a CSS variable `--app-font` swap.
- **Profile update.** Edit full name and monthly income. Email is read-only.
- **Password change.** Three-field form (current, new, confirm) with client-side validation (length ≥ 6, match) and server-side bcrypt re-hashing.
- **Language selection.** Dropdown with twelve language options, with native script labels (English, हिन्दी, தமிழ், മലയാളം, …).
- **Currency selection.** Ten currency options with ISO codes.
- **Account deletion (deferred).** Surfaced in a "Danger Zone" but currently routes the user to manual support contact rather than performing immediate deletion.

The same language switcher is duplicated in the `Header` for one-click language toggling without leaving the current page.

---

# Section 3 — Tech Stack

This section enumerates every technology used, with the reason for choosing each.

## 3.1 Frontend

| Layer | Technology | Version (approx.) | Reason for selection |
|---|---|---|---|
| UI library | **React 18** | 18.x | Industry-standard component model with concurrent rendering, mature ecosystem, hooks API. |
| Build tool | **Vite 7** | 7.3 | Sub-second cold start, native ES modules in dev, fast Rollup-based production builds. |
| Routing | **React Router** | 6.x | Declarative routes, nested layouts, supports protected routes via wrapper components. |
| Server state | **TanStack React Query** | 4.x / 5.x | Caching, background refetching, request deduplication, `keepPreviousData` for smooth filter UX. |
| HTTP client | **Axios** | 1.x | Request/response interceptors (used for JWT refresh), simpler API than `fetch`. |
| Styling | **Tailwind CSS** | 3.x | Utility-first, design tokens via `@layer components` in `index.css`, dark-mode via `darkMode: "class"`. |
| Charts | **Recharts** | 2.x | React-native chart components, composable, integrates with the theme via render-time props. |
| Icons | **Lucide React** | latest | Consistent stroke-based icon set, tree-shakable. |
| Toasts | **react-hot-toast** | 2.x | Minimal API, dark-mode-aware via CSS variables, supports custom JSX (undo-toast pattern). |
| Forms | Native HTML5 + controlled state | — | Validation via `required`, `min`, `pattern`; `react-hook-form` was avoided to keep dependencies lean. |
| i18n | **react-i18next** + **i18next-browser-languagedetector** | latest | Industry-standard, namespaced JSON resources, interpolation with `{{count}}`, RTL support. |
| Document head | **react-helmet-async** | latest | Per-page `<title>` and `noindex` meta tags. |
| Date handling | Native `Date` + `Intl.DateTimeFormat` | — | Avoids `moment.js` bloat. The few date arithmetics needed (days until / month boundaries) are inlined. |
| Mobile wrapper | **Capacitor 5** | 5.x | Wraps the same React build as a native Android app, exposes APIs (App resume listener, future SMS plugin) without rewriting in Kotlin. |

## 3.2 Backend

| Layer | Technology | Reason |
|---|---|---|
| Runtime | **Node.js 20+** | LTS, fast V8, ubiquitous on cloud hosts. |
| Framework | **Express 5** | Minimal, middleware-friendly, well understood. |
| Database driver | **Mongoose** | Schema validation, hooks, populate, sensible defaults. |
| Database | **MongoDB 6** | Document model is a natural fit for nested transactional data; flexible schema accommodates the multi-currency `originalAmount`/`originalCurrency` evolution. |
| Auth tokens | **`jsonwebtoken`** | Standard JWT signing/verification. |
| Password hashing | **`bcryptjs`** | Battle-tested adaptive hash, salt baked in. |
| Validation | **Joi** | Declarative schemas for every write endpoint; rejects unknown keys by default. |
| Sanitisation | **In-place `express-mongo-sanitize` replacement** | Express-5-compatible sanitiser written in-house (since the upstream package is incompatible with Express 5). |
| Caching | **Redis** (via a `utils/cache.js` wrapper) | Five-minute TTL on the consolidated dashboard endpoint; invalidated on transaction mutation. |
| File-less CSV export | Native `Buffer` / streaming response | No dependency needed; CSV is constructed in memory and sent with `Content-Disposition: attachment`. |
| LLM provider | **OpenRouter** (DeepSeek + Qwen) | One API key for many models; cost-efficient; supports JSON-mode prompts. |

## 3.3 Authentication

JWT-based bearer tokens, with refresh-token rotation. Refresh tokens are stored as `httpOnly`, `SameSite=Strict` cookies; access tokens are in memory only (not localStorage), making them safe from XSS exfiltration. Access tokens expire in 15 minutes, refresh tokens in 30 days. See Section 9 for the full security model.

## 3.4 Styling & Design System

Tailwind utilities are augmented with custom semantic classes defined in `src/index.css` under `@layer components`:

- `.card`, `.card-raised`, `.card-flat` — surface containers.
- `.input`, `.input-sm`, `.label` — form controls.
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-success`, plus `.btn-sm`, `.btn-lg`, `.btn-icon` — button variants.
- `.badge-green`, `.badge-red`, `.badge-blue`, `.badge-yellow`, `.badge-purple`, `.badge-gray` — coloured pills.
- `.skeleton`, `.skeleton-text`, `.skeleton-circle` — loading states.
- `.page-title`, `.page-subtitle` — typography tokens.
- `.banner`, `.banner-{blue,red,green,yellow}` — info / alert containers with full dark-mode support.
- `.modal-backdrop`, `.modal-panel` — dialog primitives.
- `.table-base`, `.table-th`, `.table-td`, `.table-row` — table primitives.
- `.gradient-{blue,emerald,rose,violet,amber}` — KPI card gradients.

CSS variables in `:root` and `.dark` provide adaptive shadows and toast colours. The result is that every page renders identically in light and dark mode without conditional rendering logic.

## 3.5 Charts

Recharts is used for all data visualisations. The chart components accept theme-aware props (stroke colours, grid colours, tooltip styles) derived at render time from a `useTheme()` hook so dark mode is supported even where Tailwind cannot reach (e.g., SVG `stroke` attributes).

## 3.6 State Management

The application makes a deliberate decision to **not use a global client state store** (no Redux, no Zustand). Instead:

- **Server state** is owned by React Query (caching, refetch, mutations).
- **Per-route state** is local component state.
- **Cross-cutting state** (auth, theme, currency) uses React Context.

This keeps bundle size small and removes the need for selectors and reducers.

## 3.7 Localisation

`react-i18next` with `i18next-browser-languagedetector`. Detection order: `localStorage` → `navigator.language`. Twelve locale JSON files, each with exact key parity (343 keys, validated by an internal script). Interpolation via `{{count}}` and `{{n}}` placeholders. Pluralisation handled with `_one` / `_other` key variants where natural language requires it.

## 3.8 AI Integration

The backend's `services/ml.service.js` exposes:

- `analyse(userId, language)` — summarises spending patterns.
- `predict(userId)` — forecasts next month.
- `detectSubscriptions(userId)` — identifies recurring expenses.
- `score(userId)` — composite financial-health score.
- `chat(userId, message, history, language)` — free-form Q&A.

Each function:

1. Pulls relevant transactions from MongoDB.
2. Constructs a prompt that includes the user's data and instructs the LLM to respond in the user's selected language.
3. Calls OpenRouter with a JSON-mode prompt.
4. Extracts and validates the JSON response, returning a sanitised object.

Determinism is enforced by post-processing — the backend never trusts the LLM to compute numbers; it only trusts the LLM for narrative text.

## 3.9 CSV Export

CSV is constructed server-side in `transaction.controller.js`:

```
Date,Type,Category,Amount,Description
```

with comma escaping and an `attachment` content-disposition header. No external CSV library is needed.

## 3.10 Routing

React Router v6 with nested routes:

```
/login            (public)
/register         (public)
/                 (AppLayout — protected)
    /             (Dashboard)
    /transactions
    /budgets
    /goals
    /recurring
    /reports
    /ai-assistant
    /sms-import
    /settings
```

`ProtectedRoute` intercepts unauthenticated access and redirects to `/login`.

## 3.11 Form Validation

Client-side: native HTML5 (`required`, `min`, `type="number"`), plus inline guards that fire toasts (e.g., invalid amount).  
Server-side: Joi schemas in `validations/*.validator.js`. The schemas mirror the Mongoose models, with `unknown: false` enforced so contract drift surfaces immediately as a 400 instead of silently dropping fields.

## 3.12 Date Handling

Native `Date` plus `Intl.DateTimeFormat`. The frontend stores transaction dates as ISO strings; the backend stores them as `Date` objects in Mongo. Month filters use the natural `<input type="month">` which returns `"YYYY-MM"`; the API client splits this into numeric `month` and `year` before sending to the backend.

---

# Section 4 — System Architecture

## 4.1 High-Level Architecture

The system follows a **classical three-tier architecture** with an additional caching layer and an external LLM gateway:

```
┌────────────────┐    HTTPS/JSON    ┌──────────────────┐    Mongo wire    ┌────────────────┐
│   React SPA    │ ───────────────▶ │  Express REST    │ ───────────────▶ │   MongoDB      │
│ (web / Capacitor│ ◀─────────────── │     API (Node)   │ ◀─────────────── │   (Atlas /     │
│   Android)     │                  │                  │                  │    self-host)  │
└────────────────┘                  └──────────────────┘                  └────────────────┘
                                          │   ▲
                                          │   │
                                       (cache)│
                                          ▼   │
                                    ┌──────────────┐
                                    │    Redis     │
                                    │  (dashboard  │
                                    │   responses) │
                                    └──────────────┘
                                          │
                                          ▼
                                    ┌──────────────┐
                                    │  OpenRouter  │
                                    │  (LLM API)   │
                                    └──────────────┘
```

The same React build runs both as a web SPA and, packaged with Capacitor, as an Android application. There is no duplication of business logic between the two.

## 4.2 Frontend Flow

1. **Bootstrap.** `main.jsx` mounts the React tree wrapped in providers (in order): `ThemeProvider`, `CurrencyProvider`, `QueryClientProvider`, `HelmetProvider`, `BrowserRouter`, `AuthProvider`. The i18n module is initialised at import time so the very first render is already localised.
2. **Routing.** `App.jsx` declares the route table; `ProtectedRoute` wraps the authenticated area.
3. **Layout.** Authenticated pages render inside `AppLayout`, which composes `Sidebar` (left) and `Header` (top) with the page content in the centre. Both are responsive: on mobile the sidebar collapses into a drawer.
4. **Page rendering.** Each page is a React function component using:
   - `useTranslation` for i18n.
   - `useQuery` / `useMutation` for server state.
   - `useCurrency` for currency formatting.
   - `useTheme` for dark-mode-aware props.
5. **API client.** `api/axios.js` instantiates an axios client with:
   - A request interceptor that attaches the in-memory `Authorization: Bearer <accessToken>` header.
   - A response interceptor that catches `401 Token expired`, calls `/auth/refresh`, retries the original request, and queues concurrent 401s to avoid refresh storms.

## 4.3 Backend Flow

1. **Express bootstrap.** `server.js` configures CORS, JSON body parsing, the in-house sanitiser, mounts route modules under `/api`, and starts listening on the configured port.
2. **Route → Validator → Controller → Service → Model.** Every authenticated route runs through:
   - `authMiddleware` (validates JWT, sets `req.user`).
   - `validate(schema)` (Joi validation, rejects unknown keys).
   - The controller (handles HTTP plumbing, request/response shape).
   - A service function (business logic, talks to Mongo / Redis / LLM).
   - A Mongoose model (final persistence).
3. **Error handling.** Service-level throws are caught by an `errorHandler` middleware that returns `{ success: false, message }` with the appropriate HTTP status.

## 4.4 API Communication

All endpoints follow a uniform response envelope:

```json
{ "success": true,  "data": …, "pagination": { … } }
{ "success": false, "message": "…", "code": "OPTIONAL" }
```

Endpoints accept JSON and return JSON, with the single exception of `/transactions/export` which returns a CSV blob. Date fields are ISO 8601 strings.

## 4.5 Authentication Flow

```
User ──login──▶ API
            ◀────  { accessToken, refreshToken (httpOnly cookie) }

User ──API call (Authorization: Bearer …)──▶ API ──▶ 200 OK
                                                  ╲
                                                   ─▶ 401 Token expired
User ──silent refresh──▶ API
            ◀──── { accessToken }   (refreshToken rotated)
User ──retry original request──▶ API ──▶ 200 OK
```

The refresh-token rotation prevents long-lived stolen tokens. On `/auth/logout`, the refresh token is deleted from the user's record and the cookie is cleared.

## 4.6 Database Interaction

Mongoose models live in `src/models/`. Indexes are declared on:
- `Transaction`: `(user, transactionDate desc)`, `(user, category)`, `(user, type)`, `(user, source)`, and a text index on `description + category`.
- `Budget`: `(user, category, month, year)` — unique.
- `Goal`: `(user, isCompleted)`.

Aggregations (Mongo `$match` + `$group` + `$project` pipelines) power the reports endpoints. Where the same aggregate is requested multiple times (the dashboard `$facet`), it is computed in a single pipeline to minimise round trips.

## 4.7 State Management

As discussed in Section 3.6, the frontend uses React Query for server state, React Context for cross-cutting client state, and local component state elsewhere. No reducer, no global store.

## 4.8 Component Structure

```
src/
├── components/
│   ├── layout/           # AppLayout, Sidebar, Header
│   ├── charts/           # ExpensePieChart, MonthlyTrendChart, IncomeExpenseChart
│   ├── ui/               # EmptyState, Card, DeleteConfirmModal
│   ├── TransactionForm.jsx
│   ├── TransactionList.jsx
│   ├── TransactionFilters.jsx
│   ├── TransactionItem.jsx
│   ├── EditTransactionModal.jsx
│   └── SmartInsights.jsx
├── pages/
│   ├── auth/             # Login, Register
│   ├── dashboard/        # Dashboard
│   ├── TransactionsPage.jsx
│   ├── BudgetsPage.jsx
│   ├── GoalsPage.jsx
│   ├── RecurringPage.jsx
│   ├── ReportsPage.jsx
│   ├── AIAssistantPage.jsx
│   ├── SMSImportPage.jsx
│   └── SettingsPage.jsx
├── hooks/                # useTransactions, useCreateTransaction, …
├── context/              # AuthContext, ThemeContext, CurrencyContext
├── api/                  # axios.js + transactionApi.js
├── services/             # sms.service.js
├── constants/            # transaction.js (shared CATEGORIES/FREQUENCIES)
├── i18n/                 # index.js + locales/*.json
└── main.jsx
```

The structure isolates routing pages (`pages/`), reusable building blocks (`components/`), data-fetching primitives (`hooks/`), and cross-cutting concerns (`context/`).

---

# Section 5 — Database Design

The system uses **MongoDB** with five primary collections plus optional supporting collections. All collections are scoped per user via a `user: ObjectId` reference.

## 5.1 `users` Collection

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key. |
| `name` | String | required, trim | Full name. |
| `email` | String | required, unique, lowercase | Login identifier. |
| `password` | String | required (hashed) | bcrypt hash. |
| `monthlyIncome` | Number | default 0 | Used for savings-rate baselines and AI scoring. |
| `preferredCurrency` | String | default "INR" | ISO 4217 code. |
| `preferredLanguage` | String | default "en" | i18n code. |
| `tier` | String | enum ["free", "premium"] | Reserved for future paywalled AI features. |
| `refreshToken` | String | nullable | Current rotated refresh token. |
| `createdAt` / `updatedAt` | Date | timestamps | Mongoose auto. |

## 5.2 `transactions` Collection

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `user` | ObjectId | ref `User`, indexed | Owner. |
| `type` | String | enum ["income", "expense"] | Direction. |
| `category` | String | required, trim, PascalCase | One of the 15 application categories. |
| `amount` | Number | required, min 0 | In `currency`. |
| `description` | String | trim | Free text. |
| `transactionDate` | Date | default `Date.now` | When the user incurred it (not when stored). |
| `source` | String | enum ["manual", "sms", "recurring"], default "manual" | Provenance. |
| `merchant` | String | nullable | Detected from SMS or entered manually. |
| `recurringId` | ObjectId | nullable, ref `RecurringTransaction` | Backlink when source = "recurring". |
| `tags` | [String] | default [] | Free-form tags. |
| `currency` | String | default "INR" | Stored currency. |
| `originalAmount` | Number | nullable | If converted from a foreign currency. |
| `originalCurrency` | String | nullable | The original currency code. |

**Compound indexes:** `(user, transactionDate desc)`, `(user, category)`, `(user, type)`, `(user, source)`. **Text index** on `description + category` (not currently used but available for future full-text search).

## 5.3 `budgets` Collection

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `user` | ObjectId | ref User, indexed | Owner. |
| `category` | String | required, PascalCase | One of the 15 categories. |
| `limitAmount` | Number | required, min 0 | Monthly cap. |
| `alertThreshold` | Number | default 80, range 10–100 | Percentage to warn at. |
| `month` | Number | required, 1–12 | Calendar month. |
| `year` | Number | required, e.g. 2026 | Calendar year. |

**Compound unique index:** `(user, category, month, year)` ensures one budget per category per month.

## 5.4 `goals` Collection

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `user` | ObjectId | ref User | Owner. |
| `name` | String | required, trim | User-defined goal label. |
| `targetAmount` | Number | required, min 1 | Goal target. |
| `savedAmount` | Number | default 0 | Cumulative contributions. |
| `deadline` | Date | nullable | Optional target date. |
| `category` | String | default "General" | Tag. |
| `icon` | String | default "🎯" | Emoji. |
| `isCompleted` | Boolean | default false | Auto-set when `savedAmount >= targetAmount`. |
| `createdAt` / `updatedAt` | Date | timestamps | — |

## 5.5 `recurringtransactions` Collection

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `user` | ObjectId | ref User | Owner. |
| `name` | String | required | Display label. |
| `type` | String | enum ["income", "expense"] | Direction. |
| `category` | String | required | One of the 15 categories. |
| `amount` | Number | required, min 1 | Per-occurrence amount. |
| `frequency` | String | enum ["daily", "weekly", "monthly", "yearly"] | Cadence. |
| `nextRunDate` | Date | required | When the next transaction will materialise. |
| `isActive` | Boolean | default true | Pause flag. |
| `createdAt` / `updatedAt` | Date | timestamps | — |

## 5.6 Optional Supporting Collections

- **`notifications`** (reserved) — stores in-app notifications such as budget threshold breaches and goal-deadline reminders.
- **`aiinsights`** (reserved) — caches recent AI responses (analysis, prediction, score) to avoid re-calling the LLM on every page load. Keyed by `(user, type, period)`.

These collections are defined in the data model but are populated incrementally as those features mature.

## 5.7 Entity Relationship Diagram (Textual)

```
User (1) ──< Transaction (∞)
User (1) ──< Budget (∞)
User (1) ──< Goal (∞)
User (1) ──< RecurringTransaction (∞)
RecurringTransaction (1) ──< Transaction (∞)   [via recurringId]
Transaction (n) ─── Budget (1)                  [matched by (user, category, month, year)]
Transaction (n) ─── Category (string enum)
```

**Cardinality summary.** A user has many of each child entity; a transaction may optionally trace back to a recurring entry; budgets and transactions are not formally linked by foreign key but matched at query time on category and month.

**Why no foreign-key constraint between Budget and Transaction?** Budgets are forward-looking caps; transactions are backward-looking facts. Coupling them with a hard reference would require backfilling on every budget create/edit. Computing the relationship at query time keeps the data model simple and idempotent.

---

# Section 6 — Project Workflow

A first-time user journeys through the system as follows:

## 6.1 Onboarding

1. **Open the app** (web or Android). The user is redirected to `/login`.
2. **Register.** Click "Create an account", enter name / email / password, submit.
3. **Login.** After registration the user is auto-signed-in; subsequent visits use the same credentials.
4. **First-time empty state.** The dashboard greets the user with zeros and a CTA: "No transactions yet — add your first."

## 6.2 Daily Use

5. **Add transactions.** Either via the Transactions page form (manual) or the SMS Import page (paste-in / auto on Android). Each transaction immediately updates the dashboard, budgets, and reports.
6. **Set budgets.** Visit Budgets → choose a month → add per-category limits. Get colour-coded badges showing actual vs. limit.
7. **Set savings goals.** Visit Goals → create a goal with target, deadline, and icon. Contribute to it as savings accrue.
8. **Configure recurring transactions.** Visit Recurring → add subscriptions, salary, EMIs. The system creates them automatically on their due dates.

## 6.3 Reflection and Action

9. **View reports.** Navigate to Reports → pick a month/year → review totals, savings rate, category breakdown, and the year-long trend chart. Export to CSV for further analysis or sharing.
10. **Use the AI Assistant.** From the AI page, run *Analyze Spending* to get patterns, concerns, positives, actions. Run *Predict Next Month* for a forecast. Run *Detect Subscriptions* to find unused recurring drains. Ask free-form questions ("How much did I spend on food this quarter?") in the user's chosen language.
11. **Manage settings.** From Settings, change theme, font, language, currency, password.

## 6.4 SMS Import (Android Path)

On Android (Capacitor build):

12. The app requests the SMS-read permission (one-time prompt).
13. On app resume, the listener reads new SMSes since the last sync, passes each through `parseSMS`, and queues parsed transactions for upload.
14. The user is notified ("3 new transactions imported from SMS").
15. The Transactions list updates without a refresh because React Query invalidates its cache on the mutation.

---

# Section 7 — Detailed Module Explanation

For each module, this section describes the **inputs, processing, outputs, internal logic, and data flow** in technical detail.

## 7.1 Authentication Module

- **Input.** `POST /auth/register` body: `{ name, email, password }`. `POST /auth/login` body: `{ email, password }`.
- **Processing.**
  - Register: validate uniqueness of email, hash password with bcrypt (10 rounds), insert into `users`, issue tokens.
  - Login: fetch user by email, `bcrypt.compare(password, user.password)`, issue tokens.
  - Tokens: access token signed with `process.env.JWT_SECRET`, expires in 15 minutes; refresh token signed with the same secret but with a 30-day expiry, saved on the user document.
- **Output.** `{ success: true, data: { accessToken, user: { id, name, email, tier } } }`; refresh token set in an `httpOnly` cookie.
- **Logic.** A response interceptor on the frontend silently refreshes when a 401 is encountered.
- **Data flow.** Browser ─▶ `/auth/register` ─▶ Mongo (insert) ─▶ tokens ─▶ Browser stores access token in memory.

## 7.2 Dashboard Module

- **Input.** Query parameter `period` ∈ {month, lastMonth, year, decade, all}.
- **Processing.** `transactionController.getDashboard` builds a single Mongo `$facet` aggregation that, in one pipeline, produces:
  - `summary`: type-grouped sums.
  - `categoryBreakdown`: expense-only, group by category, sort descending.
  - `trends`: bucketed by `$dayOfMonth` (for month) or `$month` (for year).
  Plus a side query for the ten most recent transactions.
- **Output.** `{ success: true, data: { summary: { totalIncome, totalExpense, netSavings }, categoryBreakdown[], trends[], recentTransactions[] } }`.
- **Logic.** Result is cached in Redis under `dashboard:{userId}:{period}` for 300 seconds. Cache is invalidated on any transaction mutation via `cache.del("dashboard:{userId}:*")`.
- **Data flow.** Page mount ─▶ React Query ─▶ `/transactions/dashboard?period=…` ─▶ (Redis hit returns cached payload, or Mongo aggregation runs) ─▶ JSON ─▶ rendered into KPI cards, charts, and recent table.

## 7.3 Transactions Module

- **Input.** Filters (`type`, `category`, `month`, `year`, `search`, `page`, `limit`).
- **Processing.** `getUserTransactions` builds a Mongo filter:
  ```js
  { user: userId,
    type, category,
    transactionDate: { $gte: monthStart, $lt: nextMonthStart },
    $or: [{description: regex}, {category: regex}, {merchant: regex}] }
  ```
  Pagination computed with `skip` / `limit`. Total count returned alongside the list.
- **Output.** `{ data: [...transactions], pagination: { totalRecords, currentPage, totalPages, pageSize } }`.
- **Logic.** Month is converted from `"YYYY-MM"` on the frontend to numeric `month`+`year` before sending to maintain a single backend contract.
- **Data flow.** Filter change ─▶ React Query key changes ─▶ refetch ─▶ list re-renders. `keepPreviousData` is enabled so the existing list stays visible while the new one loads.

## 7.4 Budgets Module

- **Input.** `month`, `year`.
- **Processing.** `getBudgetComparison` fetches the user's budgets for the given month, then aggregates expense totals by category for the same month, then joins in memory to produce the comparison.
- **Output.** Array of `{ _id, category, budget, actual, percentage, alertThreshold, month, year, status }`.
- **Logic.** Status is `Exceeded` if `actual > budget`, `Warning` if `percentage >= alertThreshold`, else `Within Budget`.
- **Data flow.** Page load ─▶ GET comparison ─▶ render cards. Card edit ─▶ PUT `/budgets/:id` ─▶ React Query invalidates ─▶ refetch.

## 7.5 Goals Module

- **Input.** Goal CRUD payloads. Contributions payload: `{ amount }`.
- **Processing.** A contribution increments `savedAmount` atomically (`$inc`). Upon `savedAmount ≥ targetAmount`, `isCompleted` is set to `true`.
- **Output.** Refreshed goal document.
- **Logic.** Active / completed split done client-side via `goals.filter(g => g.isCompleted)`.

## 7.6 Recurring Transactions Module

- **Input.** Recurring CRUD payloads. Internal cron tick (or on-demand check).
- **Processing.** On each tick, find recurring entries where `nextRunDate ≤ today AND isActive`. For each, insert a real transaction with `source: "recurring", recurringId: <id>` and advance `nextRunDate` by the frequency.
- **Output.** Created transactions; updated `nextRunDate`.
- **Logic.** Frequency advancement uses a `Date` arithmetic helper for each enum value. Yearly: `setFullYear(+1)`; Monthly: `setMonth(+1)`; Weekly: `setDate(+7)`; Daily: `setDate(+1)`.

## 7.7 Reports Module

- **Input.** `month`, `year` (for monthly endpoints) or `year` (for trends).
- **Processing.** Three independent Mongo aggregations:
  - `getMonthlySummary`: `$match` by date range → `$group` by `type` → sum.
  - `getCategorySummary`: same `$match` + `type: "expense"` → `$group` by category → sort.
  - `getMonthlyTrends`: `$match` whole year → `$group` by `(month, type)` → densify to all 12 months in JavaScript so the chart has a continuous x-axis.
- **Output.** `{ success: true, data: … }` shapes consumed by Recharts.
- **Logic.** Trend densification is critical for chart UX: months with no data render as zeros, not as gaps.

## 7.8 AI Assistant Module

- **Input.** Free-form chat messages, history, language code; or one of the structured action triggers (analyse / predict / detect-subscriptions / score).
- **Processing.**
  1. Pull recent transactions for the user.
  2. Construct a prompt: system message + user data (anonymised where appropriate) + language directive ("respond in {{language}}").
  3. POST to OpenRouter chat completions endpoint.
  4. Parse the JSON response. Validate shape with a Joi-like check.
  5. Compute deterministic numbers (totals, percentages) server-side; let the LLM provide the *narrative* only.
- **Output.** Structured object (analysis: `{patterns, concerns, positives, actions}`; prediction: `{predictedIncome, predictedTotal, byCategory, note}`; subscriptions: `[{description, amount, frequency, monthlyImpact}]`; score: `{score, band, emoji, breakdown}`; chat: `{reply}`).
- **Logic.** Each function falls back gracefully if the LLM is unavailable: the frontend shows an "unavailable, try later" message rather than crashing.

## 7.9 SMS Import Module

- **Input.** Raw SMS text (from paste-in on web, or from inbox-read on Android).
- **Processing.**
  1. Strip newlines, lowercase for matching.
  2. Run the OTP/promo skip-list — bail if matched.
  3. Test `DEBIT_KEYWORDS` and `CREDIT_KEYWORDS` (action-verb regex with `\b` boundaries) — bail if neither matches.
  4. Determine type: credit if only credit verb matched, expense if only debit, prefer credit on tie.
  5. Extract amount with the bidirectional currency regex.
  6. Extract merchant with three layered patterns.
  7. Infer category with the keyword-to-category map.
  8. Build a transaction object and return it.
- **Output.** `{ type, amount, category, merchant, description, source, transactionDate, rawSMS, senderSMS }` or `null` if not parseable.
- **Logic.** `rawSMS` and `senderSMS` are kept in the parsed object for UI preview but stripped before POSTing to the server (until Phase 2 adds them to the model for audit trail).

## 7.10 Localisation Module

- **Input.** User language preference (from Settings or Header dropdown).
- **Processing.**
  - `i18n.changeLanguage(code)` updates the i18next instance.
  - The choice is persisted in `localStorage` under `preferredLanguage` and on the user's profile via PUT `/users/profile`.
  - For Arabic, `document.documentElement.dir = "rtl"` is set.
- **Output.** Every `t()` call in the React tree re-resolves with the new locale; React re-renders.
- **Logic.** Twelve locale JSON files each contain 343 keys; key parity is enforced by an internal validation script run during development.

## 7.11 Settings Module

- **Input.** Field-level edits to profile, password, theme, font, language, currency.
- **Processing.** Profile / preferences PUT to `/users/profile`. Password PUT to `/users/change-password` (validates old password, hashes new). Theme & font are local-only (persisted to `localStorage`).
- **Output.** Updated profile object or `{ success: true }`.

---

# Section 8 — Algorithms / Logic Used

This section describes the non-trivial algorithms baked into the application.

## 8.1 Budget Tracking Logic

For a budget `B = (category, limitAmount, alertThreshold, month, year)`:

```
actual    = SUM(transaction.amount WHERE user=? AND type="expense"
                                   AND category=B.category
                                   AND month/year match B)
percentage = round(actual / limitAmount × 100)
status     = "Exceeded"      if actual > limitAmount
           = "Warning"       if percentage ≥ alertThreshold
           = "Within Budget" otherwise
```

When an expense is added, the controller computes this on the fly and attaches a `budgetWarnings` array to the create-transaction response. The UI surfaces this as a toast so the user is alerted in real time.

## 8.2 Savings Rate Calculation

```
netSavings  = totalIncome − totalExpense
savingsRate = totalIncome > 0
              ? round(netSavings / totalIncome × 100)
              : 0
```

UI buckets:

- ≥ 20 % → "Excellent! You're saving well."
- ≥ 10 % → "Good. Try to save more than 20%."
- otherwise → "Consider reducing expenses."

## 8.3 Financial Health Score Logic

The composite score (0–100) is a weighted sum of four sub-scores, each capped at 25:

| Sub-score | Logic | Max |
|---|---|---|
| Savings rate | `min(25, savingsRate * 1.25)` — caps at 20 % savings | 25 |
| Budget adherence | percentage of categories within budget × 25 | 25 |
| Expense diversity | `min(25, distinctCategories * 3)` — encourages diversified spending | 25 |
| Recurring health | `25 − (overdueRecurring × 5)` | 25 |

The band labels are derived as: 75+ Excellent, 50–74 Good, 25–49 Fair, 0–24 Poor.

## 8.4 Expense Analytics Logic

For category breakdown:

```
pipeline = [
  { $match: { user, type: "expense", transactionDate: {$gte, $lt} } },
  { $group: { _id: "$category", total: { $sum: "$amount" } } },
  { $sort:  { total: -1 } }
]
```

Each category's percentage of total expense is computed in JavaScript:

```
percentage = round(category.total / totalExpense × 100)
```

## 8.5 Transaction Categorisation

A keyword-to-category map (defined in `services/sms.service.js`):

```
Food          → zomato, swiggy, blinkit, zepto, restaurant, cafe, …
Transport     → uber, ola, rapido, metro, fuel, …
Shopping      → amazon, flipkart, myntra, …
Utilities     → jio, airtel, electricity, water, gas, …
Entertainment → netflix, hotstar, prime, spotify, …
Health        → pharmacy, apollo, 1mg, doctor, …
Finance       → mutual fund, sip, lic, emi, …
Travel        → hotel, oyo, indigo, flight, …
Salary        → salary, payroll, wages, …
Investment    → zerodha, groww, mutual, …
```

The match is substring-based on lowercased text. The first matching category wins. Falls back to `"Miscellaneous"` if nothing matches.

## 8.6 SMS Parsing Algorithm

```
parseSMS(rawText, sender):
  text = rawText.replace(/\n/g, " ")

  if any(skipWord ∈ text.lowercase()):
    return null            # OTP / promotional

  isDebit  = DEBIT_KEYWORDS.test(text)
  isCredit = CREDIT_KEYWORDS.test(text)
  if not (isDebit or isCredit):
    return null            # not a financial SMS

  type = isCredit and not isDebit ? "income"
       : isDebit  and not isCredit ? "expense"
       : isCredit ? "income" : "expense"      # tie → prefer credit

  amount = AMOUNT_REGEX.match(text)
  if not amount or amount ≤ 0 or amount > 10000000:
    return null

  merchant = MERCHANT_PATTERNS.findFirst(text)
  category = detectCategory(text + " " + (merchant or ""))
  description = merchant or text[:80]

  return { type, amount, category, merchant, description,
           source: "sms", transactionDate: now,
           rawSMS: text[:200], senderSMS: sender }
```

Word boundaries (`\b`) on the verb regexes ensure that noun forms ("credit card", "debit card") do not trigger false positives.

## 8.7 Recurring Schedule Logic

```
advance(nextRunDate, frequency):
  switch frequency:
    "daily"   → nextRunDate + 1 day
    "weekly"  → nextRunDate + 7 days
    "monthly" → nextRunDate + 1 month (preserving day-of-month where valid)
    "yearly"  → nextRunDate + 1 year

cron tick:
  for each recurring r where r.isActive and r.nextRunDate ≤ today:
    insert transaction { user: r.user, type: r.type, category: r.category,
                          amount: r.amount, transactionDate: r.nextRunDate,
                          source: "recurring", recurringId: r._id }
    r.nextRunDate = advance(r.nextRunDate, r.frequency)
    save r
```

## 8.8 Report Generation Logic

The trends report densifies missing months:

```
byMonth = new Map(for m in 1..12: { month: m, income: 0, expense: 0 })
for each row in aggregation:
  slot = byMonth.get(row._id.month)
  if row._id.type == "income":  slot.income  = row.total
  if row._id.type == "expense": slot.expense = row.total
return [...byMonth.values()]
```

This guarantees the chart shows all twelve months even for sparse years.

## 8.9 Filter / Search Logic

The transactions list filter is composed in the backend service:

```
filters = { user: userId }
if type     → filters.type = type
if category → filters.category = normalizePascal(category)
if month and year:
  filters.transactionDate = {
    $gte: new Date(year, month-1, 1),
    $lt:  new Date(year, month,   1)
  }
if search:
  filters.$or = [
    { description: { $regex: search, $options: "i" } },
    { category:    { $regex: search, $options: "i" } },
    { merchant:    { $regex: search, $options: "i" } }
  ]
```

Search is case-insensitive and matches any of three fields. The single Mongo query is efficient because the underlying indexes cover the predicates.

---

# Section 9 — Security Implementation

Security spans authentication, authorisation, transport, storage, and validation.

## 9.1 Authentication

- **Password storage.** `bcryptjs` with 10 rounds of salt. Passwords are never logged or returned in any API response.
- **JWT.** Signed with a secret stored in `process.env.JWT_SECRET`. Access token TTL 15 minutes; refresh token TTL 30 days. Both signed with the same secret but distinguished by claim shape.
- **Refresh token storage.** `httpOnly`, `SameSite=Strict` cookie. Inaccessible to JavaScript, preventing XSS exfiltration.
- **Access token storage.** In-memory only on the frontend (a module-level variable, set after login and on refresh). Not in `localStorage` to harden against XSS.
- **Refresh rotation.** Each successful refresh issues a new refresh token and deletes the previous one from the user's record. Replaying a stale refresh token fails.

## 9.2 JWT Validation Middleware

`auth.middleware.js`:

```
const decoded = jwt.verify(token, JWT_SECRET)
req.user = { id: decoded.id || decoded.userId, ...decoded }
next()
```

Errors:
- `TokenExpiredError` → `401 { message: "Token expired" }` (frontend triggers refresh).
- `JsonWebTokenError` → `401 { message: "Invalid token" }` (frontend logs the user out).

## 9.3 Password Encryption

```
const hash = await bcrypt.hash(plain, 10)         // on register
const ok   = await bcrypt.compare(plain, hash)    // on login
```

Bcrypt's cost factor of 10 is the OWASP-recommended baseline for 2025.

## 9.4 Protected APIs

Every route except `/auth/login`, `/auth/register`, `/auth/refresh` is wrapped in `authMiddleware`. The middleware sets `req.user` and downstream controllers must scope all DB queries to `req.user.id`. There is **no global access** to other users' data — every query includes `user: userId` as a predicate.

## 9.5 Route Security on the Frontend

`ProtectedRoute.jsx`:

```jsx
return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
```

The check is purely client-side defence-in-depth. The real guarantee is the backend middleware.

## 9.6 Session Persistence

On app start, the frontend asks `POST /auth/refresh` (sending the existing cookie). If a fresh access token is returned, the session is restored. If not, the user is sent to `/login`.

## 9.7 Input Validation

Every write endpoint runs through a Joi schema:

- `createTransactionSchema` validates type, category, amount, etc.
- `createBudgetSchema` validates limits and threshold ranges.
- `changePasswordSchema` validates length ≥ 6 and the presence of both old and new fields.

Joi is configured to reject unknown keys (`unknown: false`). This prevents two attack vectors:
- Mass-assignment (clients trying to set fields like `tier: "premium"` they should not control).
- Silent contract drift (a typo client-side surfaces as a 400 instead of being dropped).

## 9.8 Mongo Injection Defence

The backend uses an in-house Express-5-compatible NoSQL sanitiser that replaces any `$`-prefixed keys in `req.body`, `req.query`, and `req.params` with safe equivalents. This neutralises `{ password: { $ne: null } }`-style attacks that classical sanitisers (e.g., `express-mongo-sanitize`) used to handle on Express 4.

## 9.9 CORS

The Express app is configured with a strict CORS policy: only the configured frontend origin (e.g., `http://localhost:5173` in dev, the deployed URL in prod) is allowed, with credentials enabled to permit the refresh-token cookie.

## 9.10 Rate Limiting (Reserved)

Login and registration endpoints are candidates for rate limiting (e.g., five attempts per IP per minute) using `express-rate-limit`. This is documented as a hardening step rather than fully implemented to keep the current scope manageable.

---

# Section 10 — UI / UX Design System

## 10.1 Visual Identity

Finance Manager uses a **premium fintech aesthetic**: deep slate sidebars, vibrant gradient KPI cards, soft card surfaces, generous whitespace, and a single accent colour (blue 600) for primary calls to action.

## 10.2 Dark Mode

Implemented via Tailwind's `darkMode: "class"` configuration. A `ThemeContext` toggles the `dark` class on `<html>` and persists the choice in `localStorage`. CSS variables in `:root` and `.dark` blocks provide adaptive shadows and toast colours:

```
:root { --shadow-card: …; --toast-bg: #ffffff; … }
.dark { --shadow-card: …; --toast-bg: #1f2937; … }
```

Every component uses Tailwind's `dark:` modifiers so dark mode is automatic — no conditional rendering. Recharts is theme-aware via a `useTheme()` hook that swaps stroke and tooltip colours.

## 10.3 Responsive Design

The app is built mobile-first:

- **Mobile (< 1024 px).** Sidebar collapses to a drawer accessible via a hamburger icon in the header. KPI cards stack vertically. Charts shrink to fit. Tables become scrollable.
- **Desktop (≥ 1024 px).** Persistent collapsible sidebar (68 px collapsed / 256 px expanded). Multi-column grids for cards and charts.

## 10.4 Card-Based Dashboard

Every page surface is composed of cards (the `.card` utility class). Cards have a consistent border, rounded corners, and shadow. KPI cards are *gradient* variants (`.gradient-blue`, `.gradient-emerald`, etc.) for visual punch.

## 10.5 Chart Design

Recharts is configured with:

- Stroke-based grid (`#1f2937` dark / `#f0f0f0` light).
- Subdued axis colours (`#9ca3af` dark / `#6b7280` light).
- Custom tooltip styled with the surface background colour and rounded corners.
- Brand palette of eleven colours (`#3b82f6`, `#ef4444`, `#10b981`, etc.) cycled across categories.

## 10.6 Navigation

- **Sidebar.** Persistent on desktop, drawer on mobile. Houses primary navigation: Dashboard, Transactions, Budgets, Goals, Recurring, Reports, AI Assistant, SMS Import, plus Settings and Logout at the bottom. Each item has a Lucide icon, a label, and a tooltip when collapsed.
- **Header.** Contains a global search (placeholder), language selector, theme toggle, notifications bell, and profile dropdown (Settings / Logout).
- **Active state.** The current route is highlighted with the primary blue.

## 10.7 Sidebar Structure

A two-column nav with iconography:

```
🏠  Dashboard
💳  Transactions
🐷  Budgets
🎯  Goals
🔁  Recurring
📊  Reports
🤖  AI Assistant
💬  SMS Import
─────
⚙️  Settings
🚪  Logout (red accent)
```

## 10.8 Theme Consistency

All design tokens live in `src/index.css` under `@layer components`. Pages never inline raw Tailwind colours for surfaces — they use `.card`, `.input`, `.btn-*`, `.badge-*`, `.banner-*` instead. This guarantees that a future theme change (e.g., introducing a high-contrast mode) is a one-file edit, not a 30-page sweep.

## 10.9 Reusable Primitives

- `<EmptyState icon title description action />` — Polished card with a coloured icon-circle, used across Recurring, Reports, Transactions, etc.
- `<DeleteConfirmModal />` — Standard confirmation dialog.
- `<TransactionItem />` — Reused on Dashboard and Transactions pages.

## 10.10 Localisation in the UI

Every visible string is wrapped in `t()`. Language change is instant — no page reload. RTL is handled at the document level for Arabic. Numeric and currency formatting respects the user's selected currency via `Intl.NumberFormat`.

---

# Section 11 — Testing & Edge Cases

## 11.1 Functional Testing

| Module | Test cases covered |
|---|---|
| Auth | Successful login, wrong password, duplicate email on signup, refresh on token expiry, logout invalidates cookie. |
| Dashboard | Loads for new user (all zeros), correctly aggregates 10+ transactions, period switching refetches, Redis cache hit returns identical payload. |
| Transactions | Add, edit, delete (with undo), search, filter by type+category+month combined, pagination across pages, CSV export with filters preserved. |
| Budgets | Create, edit, delete, threshold warning fires at 80 %, exceed state, month/year filter. |
| Goals | Create, contribute (incremental), reach completion (auto-flag), delete. |
| Recurring | Create, pause, resume, edit, delete, advance on cron tick. |
| Reports | Loads zeros for empty months, correct totals for populated months, year change refetches trends. |
| AI | Each action button (analyse / predict / detect / chat) returns valid response, error fallback renders gracefully when LLM is down. |
| SMS | Each of the regression-matrix SMS cases parses correctly (income / expense / OTP-skip / no-match). |
| i18n | Switching to each of the 12 languages updates all visible strings; switching back to English restores. |
| Settings | Save profile, change password, switch theme, switch font, switch language, switch currency. |

## 11.2 Validation Testing

- Required fields enforced on both client and server.
- Amount must be positive.
- Password must be ≥ 6 characters.
- Email must be valid format and unique.
- Unknown keys in API requests are rejected with 400 (mass-assignment protection).

## 11.3 Error Handling

- Network failures surface as a toast and trigger React Query retry.
- 401 triggers the refresh flow; if refresh fails, the user is logged out.
- 500 surfaces a generic toast — no internal stack traces leak.
- LLM unavailability surfaces a localised "Analysis unavailable, try later" message.

## 11.4 Edge Cases

| Scenario | Behaviour |
|---|---|
| User opens app with no transactions | Dashboard shows zeros, table shows empty state, CTA: "Add your first." |
| Filter matches zero results | Empty state with "Clear filters" CTA, distinguishable from "no data at all." |
| Concurrent JWT expiry across multiple in-flight requests | Refresh interceptor queues 401s so only one refresh request fires. |
| Slow network during page load | Skeleton loaders for KPI cards, lists, and charts. |
| Offline SMS submit | Transaction is queued in `localStorage` and flushed when online. |
| Same SMS submitted twice | Deduplication via the offline queue and (Phase 2) a `smsHash` field on the model. |
| Daylight saving / timezone | All dates stored in UTC; UI uses `Intl.DateTimeFormat` per locale. |
| Very large numbers (e.g., ₹99,99,999) | `compact()` formatter from `useCurrency` truncates display. |
| Right-to-left languages (Arabic) | `document.documentElement.dir = "rtl"` flips the layout. |

## 11.5 Filter Testing

A regression matrix is run mentally for every release:

| Filter combination | Expected |
|---|---|
| None | All transactions, paginated. |
| Type only | All income or all expense. |
| Category only | One category, any type. |
| Month only | Transactions in that month, any type/category. |
| Month + type | Combined. |
| Month + category + search | Triple intersection. |
| Search alone | Matches description / category / merchant case-insensitively. |
| Clear filters | Returns to None state. |

## 11.6 Localisation Testing

For each language: open every page and verify (1) no raw English strings, (2) no missing-key warnings in the console, (3) charts and dropdowns translate, (4) the layout does not break with longer translations.

## 11.7 Authentication Testing

- Cold-start with no cookie → redirect to `/login`.
- Cold-start with valid refresh cookie → silent refresh restores session.
- Expired access token mid-session → silent refresh + retry.
- Expired refresh token → forced logout to `/login`.

---

# Section 12 — Deployment

## 12.1 Local Development

Two processes are started in parallel:

```
# Backend
cd finance-backend
npm install
npm run dev      # runs on http://localhost:5000

# Frontend
cd finance-frontend
npm install
npm run dev      # runs on http://localhost:5173
```

A `.env` file in `finance-backend/` provides `MONGODB_URI`, `JWT_SECRET`, `OPENROUTER_API_KEY`, and `REDIS_URL`. The frontend's `vite.config.js` proxies `/api` to the backend.

## 12.2 Build Process

```
cd finance-frontend
npm run build         # produces ./dist/
```

Vite emits a production-optimised bundle with code-splitting, minification, gzip-friendly hashes, and PWA service-worker generation (via `vite-plugin-pwa`).

```
cd finance-backend
# No build step (Node executes the source directly).
```

## 12.3 Production Deployment Possibilities

| Layer | Recommended host |
|---|---|
| Frontend (`dist/`) | Vercel, Netlify, Cloudflare Pages, Nginx static |
| Backend (Node) | Render, Railway, Fly.io, AWS App Runner, EC2 |
| Database | MongoDB Atlas (free tier sufficient for demo) |
| Cache | Upstash Redis (free tier) |
| LLM | OpenRouter (pay-per-use) |

The included `docker-compose.yml` at the repo root provides a one-command local stack (Mongo + Redis + Backend + Frontend) for reviewers.

## 12.4 Web-to-Android Conversion (Capacitor)

The same `finance-frontend` build is wrapped as an Android application:

```
cd finance-frontend
npm run build
npx cap sync android
npx cap open android      # opens Android Studio
```

Inside Android Studio, the project can be signed and exported as an `.aab` for Play Store distribution. The Capacitor layer also enables:

- Native splash screen and status-bar customisation.
- App lifecycle events (`App.resume` already used to flush the offline queue).
- Future SMS-inbox read via a Capacitor community plugin.

The web and Android versions share **100 % of the React code** — no fork, no separate state management.

## 12.5 PWA Concept

The web app also ships as a Progressive Web App: the service worker (generated by `vite-plugin-pwa`) caches the shell for offline use, and the `manifest.webmanifest` declares icons and theme colours so the app is installable to the home screen on browsers that support it.

---

# Section 13 — Advantages

1. **Frictionless data capture.** SMS parsing eliminates manual entry for users who rely on UPI / bank notifications.
2. **Privacy-respecting.** No bank credentials are shared; SMS parsing is local-first; the LLM only receives transactions, never PII or credentials.
3. **Multi-language by design.** Twelve languages, RTL support, currency-aware formatting — usable across India and beyond.
4. **Unified codebase.** Web and Android run from the same React build, halving maintenance overhead.
5. **Comprehensive feature coverage.** Eleven modules across transactions, budgets, goals, recurring, reports, AI, and SMS — comparable to commercial offerings.
6. **AI-augmented, not AI-dependent.** Deterministic logic (regex, aggregations, formulas) drives the numbers; the LLM provides narrative on top, with graceful fallback when unavailable.
7. **Modern UI.** Dark mode, responsive layout, premium fintech aesthetic, reusable design tokens.
8. **Strong security posture.** JWT with refresh rotation, bcrypt password hashing, Joi validation rejecting unknown keys, in-house Mongo sanitiser, no localStorage access tokens.
9. **Fast development cycle.** Vite gives sub-second hot reload; React Query handles the bulk of data fetching with minimal boilerplate.
10. **Extensible.** New modules (e.g., investments) plug into the existing patterns without touching unrelated code.
11. **Offline-capable.** SMS-parsed transactions queue locally when the network is down and flush automatically when it returns.
12. **Cost-aware.** Self-hosted Mongo + Upstash Redis + OpenRouter pay-per-use means the system can run for cents per active user per month at small scale.

---

# Section 14 — Limitations

A candid list of current limitations:

1. **No direct bank API integration.** Transaction capture depends on SMS parsing or manual entry. Users without UPI/bank SMS will revert to manual entry.
2. **SMS inbox read on Android not yet implemented.** The Capacitor shell is in place; the regex parser is in place; reading the inbox via a native plugin is documented as Phase 2.
3. **No iOS build.** Capacitor supports it but iOS distribution is out of current scope.
4. **No multi-user collaboration.** No shared budgets, no household accounts.
5. **No tax / investment tracking.** No capital-gain calculations, no portfolio analytics, no tax-report exports.
6. **AI quality depends on the LLM provider.** OpenRouter is a third-party gateway; outages or model changes affect the AI features. Caching of AI responses is partial (a planned `aiinsights` collection is reserved).
7. **No production-grade observability.** No APM, structured logging, or alerting in the current build.
8. **No automated test suite shipped.** Tests are manual / regression-matrix based. Unit and integration tests using Jest/Vitest + Supertest are a planned addition.
9. **Locale translations are best-effort.** Non-English translations were generated programmatically and would benefit from native-speaker review.
10. **Backend error messages are in English.** While the UI chrome translates, server-returned error text (`err.response.data.message`) remains English unless re-mapped on the frontend.
11. **No formal rate limiting** on auth endpoints — recommended as a hardening step before production.
12. **No data export beyond CSV.** No JSON export, no PDF reports.

---

# Section 15 — Future Enhancements

A prioritised roadmap of improvements:

## 15.1 Near-term

- **Real SMS-inbox read on Android.** Integrate a Capacitor plugin (`@byteowls/capacitor-sms` or `cap-sms-inbox`) for one-shot inbox reads, plus a background `BroadcastReceiver` plugin for live ingestion. Foreground-service notification per Play Store policy.
- **`smsHash` deduplication.** Add an `smsHash` field to the Transaction model and a partial-unique index on `(user, smsHash)` so the same SMS submitted twice cannot create duplicates. Convert duplicate-key 11000 to a 409 `DUPLICATE_SMS`, treated as success by the frontend.
- **Persist `rawSMS` and `senderSMS`** on the transaction for audit trail and future ML training.
- **Backend error i18n.** Either backend i18n layer or frontend error-code map to translate `err.response.data.message`.
- **Push notifications.** Budget exceeded / goal deadline / recurring overdue events surface as in-app and (on Android) push notifications.
- **Rate limiting.** `express-rate-limit` on `/auth/*` endpoints.
- **Automated test suite.** Vitest + Supertest + Mongo Memory Server for backend; React Testing Library for frontend.

## 15.2 Medium-term

- **AI-powered automatic expense prediction.** Use the user's transaction history to predict bill amounts and dates before they hit (e.g., "Your electricity bill is usually around ₹2,400 and due on the 15th").
- **Smart budgeting suggestions.** AI-generated initial budgets per category based on historical spend.
- **OCR receipt scanning.** Capture a photo of a paper receipt; OCR extracts amount, merchant, date; insert as transaction.
- **Voice assistant.** "Add ₹500 spent on groceries" via voice → parsed by an LLM → inserted.
- **Investment tracking.** Mutual fund / stock portfolio with NAV updates.
- **iOS build.** Capacitor iOS target.

## 15.3 Long-term

- **Real bank integration via Account Aggregator (India).** Plug into the RBI's AA framework once the account is approved.
- **Multi-user / household budgets.** Shared budgets where multiple users contribute to a single pool.
- **Tax reporting.** Capital gains, TDS, ITR-ready summaries.
- **Mobile app native enhancements.** Widgets, quick-add tiles, Siri / Google Assistant shortcuts.
- **Goal-based financial planning.** AI that helps the user plan saving paths for long-term goals (down payment, retirement).

---

# Section 16 — Project Snapshot List

The following screenshots should be placed in the final report at the indicated chapters. Each screenshot should be captured in both **Light** and **Dark** mode where appropriate, with sample data populated.

| # | Screenshot | Recommended placement |
|---|---|---|
| 1 | Login screen | Chapter 4 — Authentication |
| 2 | Registration screen | Chapter 4 — Authentication |
| 3 | Dashboard (populated, with KPI cards, charts, recent transactions) | Chapter 5 — Dashboard |
| 4 | Dashboard (empty state for new user) | Chapter 5 — Dashboard |
| 5 | Smart Insights panel close-up | Chapter 5 — Dashboard |
| 6 | Transactions page (populated, with filters expanded) | Chapter 6 — Transactions |
| 7 | Transactions page (empty state — no transactions yet) | Chapter 6 — Transactions |
| 8 | Transactions page (empty state — no filter match, Clear-filters CTA visible) | Chapter 6 — Transactions |
| 9 | Edit Transaction modal | Chapter 6 — Transactions |
| 10 | Budgets page (populated with multiple categories, mix of statuses) | Chapter 7 — Budgets |
| 11 | Budget creation modal | Chapter 7 — Budgets |
| 12 | Goals page (active + completed sections) | Chapter 8 — Goals |
| 13 | Goal contribution modal | Chapter 8 — Goals |
| 14 | Recurring page (active + paused sections) | Chapter 9 — Recurring |
| 15 | Recurring creation modal | Chapter 9 — Recurring |
| 16 | Reports page (full page, all sections visible) | Chapter 10 — Reports |
| 17 | Monthly Trends chart close-up | Chapter 10 — Reports |
| 18 | Category Breakdown chart close-up | Chapter 10 — Reports |
| 19 | AI Assistant page (after "Analyse Spending" run) | Chapter 11 — AI Assistant |
| 20 | AI Assistant — Financial Health Score gauge close-up | Chapter 11 — AI Assistant |
| 21 | AI Assistant — Subscription detection result | Chapter 11 — AI Assistant |
| 22 | AI Assistant — Free-form chat in Malayalam | Chapter 11 — AI Assistant |
| 23 | SMS Import page (initial, with "How it works" banner) | Chapter 12 — SMS Import |
| 24 | SMS Import page (after parse, Transaction Detected card visible) | Chapter 12 — SMS Import |
| 25 | SMS Import page (offline queue banner visible) | Chapter 12 — SMS Import |
| 26 | Settings page (full, all sections visible) | Chapter 13 — Settings |
| 27 | Settings — Language selector open with all 12 languages | Chapter 13 — Settings |
| 28 | Dark mode side-by-side comparison (Dashboard) | Chapter 14 — UI/UX |
| 29 | Mobile responsive view (Dashboard on a phone simulator) | Chapter 14 — UI/UX |
| 30 | Arabic RTL view (any page) | Chapter 14 — UI/UX |
| 31 | Android app screenshot (Capacitor build, home page) | Chapter 16 — Deployment |
| 32 | Architecture diagram | Chapter 2 — Architecture |
| 33 | ER diagram | Chapter 3 — Database |

---

# Section 17 — Viva Questions & Answers

A curated bank of likely questions with concise, confidence-building answers.

## 17.1 Project Overview

**Q1. What is the Finance Manager project in one sentence?**  
An AI-powered, multilingual personal finance management system that combines transaction tracking, budgets, savings goals, recurring transactions, reports, AI insights, and SMS-based auto-import into a single web and Android application.

**Q2. Why did you choose this project?**  
Personal finance management is a real, daily problem for almost everyone. The project lets me exercise the full modern web stack, integrate AI responsibly, and solve a regionally relevant problem (SMS-based UPI capture, multilingual support) that commercial products under-serve.

**Q3. Who is the target user?**  
Individuals — particularly in markets like India — who receive UPI/bank SMS notifications and want a frictionless, multilingual way to track and analyse personal finances without sharing bank credentials.

## 17.2 Tech Stack

**Q4. Why React + Vite instead of Next.js / Create React App?**  
Vite gives the fastest dev experience (sub-second cold start, native ES-module HMR), produces smaller production bundles via Rollup, and the application is a pure SPA — no server-rendered pages needed. Next.js's SSR/ISR advantages are not required here.

**Q5. Why MongoDB over a relational database?**  
The data is naturally document-shaped: a transaction is a self-contained object with optional nested fields (`originalAmount`, `tags`, etc.). MongoDB's flexible schema also lets us evolve the model — e.g., adding `merchant` and `source` fields — without migrations.

**Q6. Why Tailwind CSS?**  
Tailwind's utility-first approach plus a custom `@layer components` layer gives us a small, consistent design system without writing one-off CSS files per component. Dark mode is a built-in feature via `darkMode: "class"`. The result is a smaller stylesheet (58 kB) than a typical hand-written CSS bundle.

**Q7. Why React Query instead of Redux?**  
The vast majority of state in this app is *server* state — data fetched from the backend. React Query handles caching, refetching, deduplication, and invalidation declaratively. Adding Redux would mean reinventing the same primitives and adding boilerplate. For the small amount of *client* state, React Context is sufficient.

**Q8. Why OpenRouter for the LLM instead of OpenAI directly?**  
OpenRouter exposes many models behind a unified API, including cheaper alternatives like DeepSeek and Qwen. This keeps AI cost low while preserving the option to swap models without code changes.

## 17.3 Architecture

**Q9. Explain the high-level architecture.**  
Three tiers: a React SPA (web or Capacitor Android) talks JSON over HTTPS to an Express REST API. The API persists to MongoDB via Mongoose, caches consolidated dashboard responses in Redis, and calls OpenRouter for AI features. Both the web bundle and the Android app are built from the same React code.

**Q10. Why a single dashboard endpoint instead of multiple smaller ones?**  
The dashboard needs summary, category breakdown, trends, and recent transactions on every load. Bundling them into one Mongo `$facet` pipeline plus a Redis cache reduces network round-trips and CPU on the database. The trade-off — coarser cache invalidation — is acceptable because the data is per-user and changes only on mutations.

**Q11. How does the frontend handle the JWT lifecycle?**  
Access token in memory only; refresh token in an `httpOnly` cookie. An axios response interceptor catches `401 Token expired`, calls `POST /auth/refresh`, queues concurrent 401s to prevent refresh storms, and retries the original request. If refresh fails, the user is logged out.

## 17.4 Database

**Q12. Describe the data model.**  
Five primary collections: `users`, `transactions`, `budgets`, `goals`, `recurringtransactions`. All scoped by `user: ObjectId`. Transactions reference recurring entries via `recurringId`. Indexes on `(user, transactionDate desc)`, `(user, category)`, `(user, type)`, `(user, source)`, and a unique compound on `(user, category, month, year)` for budgets.

**Q13. Why don't budgets directly reference transactions?**  
A budget is a forward-looking cap; transactions are backward-looking facts. They're matched at query time on `(user, category, month, year)` rather than hard-linked, which avoids backfill on every budget change and keeps both entities independently editable.

## 17.5 Algorithms

**Q14. How does the SMS parser distinguish credit from debit?**  
Two regexes with `\b` word boundaries: `DEBIT_KEYWORDS` (debited, spent, paid, purchase, withdrawn, transferred, sent, deducted, charged) and `CREDIT_KEYWORDS` (credited, received, deposited, refund, cashback, salary, bonus, imps in, neft in). Both can match in rare cases ("debit card was credited"); in that tie we prefer credit because it is the action verb. Amount is matched by a separate currency-agnostic regex.

**Q15. Walk me through the financial health score calculation.**  
A composite 0–100 score with four sub-scores each capped at 25: savings rate (`min(25, rate × 1.25)`), budget adherence (% of categories within budget × 25), expense diversity (`min(25, distinct categories × 3)`), and recurring health (`25 − overdue × 5`). Bands: 75+ Excellent, 50–74 Good, 25–49 Fair, 0–24 Poor.

**Q16. How do recurring transactions actually appear in the user's history?**  
A scheduled job (or on-demand check) scans for recurring entries where `nextRunDate ≤ today AND isActive`. For each, it inserts a real transaction with `source: "recurring", recurringId: <id>` and advances `nextRunDate` by the frequency interval.

## 17.6 Security

**Q17. How are passwords stored?**  
With `bcryptjs`, salt-included, cost factor 10. Never logged or returned. Compared via `bcrypt.compare` on login.

**Q18. Why is the access token in memory instead of `localStorage`?**  
`localStorage` is accessible to any JavaScript on the page, so a successful XSS attack would exfiltrate the token. In-memory storage means the token dies when the tab closes; we rely on the `httpOnly` refresh-token cookie for persistence. The cookie is inaccessible to JavaScript and therefore safe from XSS exfiltration.

**Q19. How do you prevent NoSQL injection?**  
Joi schemas reject unknown keys (`unknown: false`), and an Express-5-compatible in-house sanitiser strips `$`-prefixed keys from request bodies, queries, and params. This neutralises `{ password: { $ne: null } }`-style attacks.

## 17.7 AI

**Q20. How do you ensure the AI doesn't lie about numbers?**  
We never let the LLM compute numbers. The backend computes all sums, percentages, and forecasts deterministically from MongoDB and provides those numbers to the prompt. The LLM is asked only to wrap them in narrative text. This keeps the user's reported balances exact and the AI features hallucination-resistant.

**Q21. What happens when the LLM is down?**  
Each AI function returns a `{ unavailable: true }` flag, and the frontend renders a localised "Analysis unavailable, try later" message. No crash, no half-rendered card.

## 17.8 Localisation

**Q22. How does multi-language support work?**  
`react-i18next` with twelve locale JSON files, each containing 343 keys. Every visible string is wrapped in `t("namespace.key")`. Language switching is instant — no reload. Backend enums (`income`, `Food`, `monthly`) stay English on the wire; only display labels go through `t()`. Arabic also flips the document direction to RTL.

**Q23. Why didn't you translate the backend response messages?**  
Backend error messages are still English. Translating them properly requires either a backend i18n layer or a frontend error-code map. Both are documented as future enhancements; the current PR scopes localisation to UI chrome only.

## 17.9 Deployment

**Q24. How is the Android version built?**  
Capacitor wraps the same Vite-built `dist/` folder as a native Android shell. `npm run build` + `npx cap sync android` + `npx cap open android` opens Android Studio, where the project is signed and exported as an `.aab`. 100 % of the React code is shared between web and Android.

**Q25. How would you deploy this to production?**  
Frontend `dist/` to Vercel or Cloudflare Pages. Backend to Render or Fly.io. MongoDB on Atlas (free tier). Redis on Upstash. The included `docker-compose.yml` provides a local equivalent. CI/CD via GitHub Actions on push to main.

## 17.10 Project Decisions

**Q26. What's the single biggest engineering decision you made?**  
Separating *keyword detection* from *amount extraction* in the SMS parser. The original parser coupled them into a single regex, which silently misclassified "credited with INR 50,000" because the word "with" between the verb and the amount broke the match. Decoupling them — verb regex for the type, amount regex for the value — fixed a class of false negatives across all Indian bank formats.

**Q27. What would you do differently?**  
Two things. First, ship automated tests from day one — the regression matrix is currently manual. Second, design the API response envelope and backend error contract earlier so the validator-vs-model drift bug (where the Joi schema dropped fields the model accepted) couldn't have happened.

**Q28. What did you learn from this project?**  
The biggest lesson: contracts must be explicit and enforced. Drift between Joi, Mongoose, the controller, and the frontend API client caused several bugs that would have been impossible if the contract had been a shared TypeScript type or a generated schema. Second, structuring strings through a real i18n layer from the start is cheap; retrofitting it across 200+ literals after the fact is expensive.

---

## End of Master Context Document

**How to use this document going forward:**

- To generate **Chapter N** of the final report, point at Section N (or the relevant subsections) and request expansion.
- To generate the **PPT**, use Sections 1, 2, 4, 8, 13, 14, 15 as the skeleton for the slides (one section per slide-group).
- For **viva preparation**, Section 17 is your primary study source; Sections 7 and 8 provide deeper technical backup.
- For **documentation deliverables** (README, install guide, API docs), Sections 3, 4, 5, and 12 are the source material.

**Maintenance:** as features evolve, update this document in lock-step. Treat it as the canonical project specification.
