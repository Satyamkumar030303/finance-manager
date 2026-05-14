# Finance Manager — Screenshot Checklist for B.Tech Project Report

> **Companion document to** `MASTER_CONTEXT.md`. Use this when capturing screenshots for the final report, the project PPT, and the viva.

> **Goal.** Capture a deliberate, non-redundant set of screenshots that demonstrates every module, every cross-cutting capability (dark mode, responsiveness, localisation, Android), and the supporting architecture diagrams — at a level of polish appropriate for a strong B.Tech CSE project submission.

---

## Table of Contents

1. [Capture Standards](#1-capture-standards)
2. [Sample Data to Pre-Load Before Capturing](#2-sample-data-to-pre-load-before-capturing)
3. [Module-Wise Screenshot Checklist](#3-module-wise-screenshot-checklist)
4. [Cross-Cutting Screenshots (Dark Mode, Mobile, Localisation, Android)](#4-cross-cutting-screenshots)
5. [Diagram Screenshots (Architecture, ER, Flow)](#5-diagram-screenshots)
6. [Placement in the Final Report](#6-placement-in-the-final-report)
7. [Placement in the Viva PPT](#7-placement-in-the-viva-ppt)
8. [Capture Order (Efficient Batch Workflow)](#8-capture-order-efficient-batch-workflow)

---

## 1. Capture Standards

Follow these conventions for every screenshot so the report looks consistent and professional:

| Aspect | Standard |
|---|---|
| **Browser** | Chrome (latest) at default zoom 100 %, window 1440 × 900 px for desktop captures. |
| **Format** | PNG (lossless). JPG only if file size becomes an issue. |
| **DPI** | At least 2× retina capture if possible (looks crisp in print). |
| **File name** | `NN_module_screen.png` — e.g. `12_budgets_populated.png`. Two-digit prefix preserves order. |
| **Crop** | Capture the whole browser viewport including the URL bar **only** if the URL is illustrative (e.g. `/transactions?type=expense&month=5`). Otherwise crop out the chrome. |
| **Cursor / selection** | Hide the cursor. Don't leave text selected. |
| **Privacy** | Use a placeholder email (`student@example.com`), a non-personal name ("Aarav Kumar" / "Priya Singh"). No real bank account numbers. |
| **Timestamp** | Capture so the dates make sense relative to each other (May 2026 set, March 2026 set). |
| **Dark mode** | Capture **both** light and dark for the headline pages (Dashboard, Transactions, Reports, AI). For other pages, dark mode once is enough — placed in a side-by-side figure in the UI chapter. |
| **Currency** | Use **INR** (₹) for the primary set — the project is India-focused. Capture one screenshot with **USD** to demonstrate currency switching. |
| **Language** | Most screenshots in **English**. Have at least three screenshots in **Malayalam** and two in **Arabic (RTL)** for the localisation chapter. |

---

## 2. Sample Data to Pre-Load Before Capturing

Before starting the capture session, seed the database so the screenshots tell a coherent financial story. Suggested seed:

**User profile**
- Name: `Aarav Kumar`
- Email: `aarav.kumar@example.com`
- Monthly income: ₹60,000
- Preferred currency: INR
- Preferred language: English (switched to Malayalam / Arabic for select screenshots)

**Transactions** (~ 40 entries across May 2026 / April 2026 / March 2026)

Mix of:

- Income — Salary ₹55,000 on the 1st of each month (recurring), Freelance ₹8,500 once.
- Expenses — Food (Zomato ₹420, Swiggy ₹680, BigBasket ₹1,240), Transport (Uber ₹220, Fuel ₹2,800), Shopping (Amazon ₹1,850, Flipkart ₹3,400), Utilities (Jio ₹399, Electricity ₹2,100), Entertainment (Netflix ₹649, BookMyShow ₹540), Health (1mg ₹780), Travel (IndiGo ₹4,800), Bills (LIC ₹2,500), Miscellaneous (Stationery ₹350).

This populates every category, both types, three months for trend charts, and gives mixed budget statuses.

**Budgets** (for May 2026)
- Food ₹6,000 (actual ₹4,580 — Warning at 76 %)
- Transport ₹3,500 (actual ₹3,800 — Exceeded)
- Shopping ₹5,000 (actual ₹2,100 — Within Budget)
- Entertainment ₹2,000 (actual ₹1,189 — Within Budget)
- Utilities ₹3,000 (actual ₹2,499 — Within Budget)

**Goals**
- 🚗 New Bike — target ₹80,000, saved ₹32,000, deadline 31-Dec-2026 (Active, 40 %).
- 🏠 Emergency Fund — target ₹1,00,000, saved ₹1,00,000 (Completed).
- ✈️ Goa Trip — target ₹25,000, saved ₹18,500, deadline 30-Nov-2026 (Active, 74 %).

**Recurring**
- Salary — Income — Monthly — ₹55,000 — 1st of each month — Active.
- Netflix — Expense — Monthly — ₹649 — 5th — Active.
- Jio Mobile — Expense — Monthly — ₹399 — 8th — Active.
- LIC Premium — Expense — Yearly — ₹12,000 — Active.
- Gym — Expense — Monthly — ₹1,500 — Paused.

**SMS Examples**
- Credit (SBI NEFT ₹50,000): `Your a/c XXXX9876 is credited with INR 50,000.00 on 12-05-2026 by NEFT. UPI Ref:123456789012. -SBI`
- Debit (HDFC Zomato): `Dear Customer, Rs.1,500.00 debited from A/c XX1234 for ZOMATO ORDER on 12-05-2026. -HDFC Bank`
- Debit (Kotak Netflix UPI): `INR 299.00 paid to Netflix via UPI. UPI Ref: 406214887234. -Kotak Bank`

**Offline queue (for one screenshot)**
- Toggle airplane mode, parse one SMS, attempt save → ensure two items end up in the local offline queue so the "pending sync" banner renders.

---

## 3. Module-Wise Screenshot Checklist

Each entry below has: **Title | Page / Action | What must be visible | Recommended sample data | Why it matters**.

### 3.1 Authentication

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **01** | Login Screen | `/login` | Centred login card; email field, password field, "Login" button, "Don't have an account? Sign up" link; app logo / brand text "Finance Manager". | Empty form (clean state) or pre-filled with placeholder `student@example.com` and dotted password. | Establishes the entry point of the system; demonstrates authentication UI. |
| **02** | Signup Screen | `/register` | Name, email, password fields; "Create account" button; back-to-login link. | Empty form. | Shows the onboarding flow; required for the user-management section of the report. |
| **03** | Login Validation Error | Submit `/login` with wrong password | Same login card with a red toast/inline error visible ("Invalid credentials"). | Email entered, password entered, error banner showing. | Demonstrates input validation and error handling — examiners value this. |

### 3.2 Dashboard

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **04** | Dashboard — Fully Populated (Light) | `/` with all seed data loaded, period = "This Month" | Three gradient KPI cards (Total Income / Total Expense / Net Savings), period dropdown, three charts (Expense by Category, Spending Trend, Income vs Expense), Smart Insights panel, Recent Transactions table. | The full May 2026 dataset. | The **hero screenshot** of the entire project. Use this on the report cover or Chapter-1 frontispiece. |
| **05** | Dashboard — Fully Populated (Dark) | Same as #04, theme toggled | Identical layout in dark theme. | Same. | Demonstrates that dark mode is first-class, not a half-finished afterthought. |
| **06** | Dashboard — Empty State (New User) | `/` for a brand-new user with zero transactions | KPI cards reading ₹0 / ₹0 / ₹0; empty-state card under Recent Transactions with "No transactions yet" + "Add your first transaction" CTA; charts replaced by empty placeholders. | A second seed user with no transactions. | Demonstrates deliberate UX design for the first-time experience; counter-balances the populated screenshot. |
| **07** | Smart Insights Close-up | `/`, scroll to Smart Insights | The Smart Insights card alone, with at least three insights (savings rate, top category, overspending warning). | May 2026 data — guaranteed to produce all three messages. | Highlights the rule-based AI/analytics value-add visually distinct from the LLM AI assistant. |
| **08** | Dashboard — Period Switcher Open | `/`, click the period dropdown | Same as #04 but with the period `<select>` open showing all five options (This Month, Last Month, This Year, Last Decade, All Time). | Same. | Documents the temporal navigation; useful in the workflow chapter. |

### 3.3 Transactions

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **09** | Transactions — Populated List | `/transactions` | Page header with "Export CSV" button; Add Transaction inline form (collapsed at top); Search bar + filters; "All Transactions" card with ~ 10 rows of mixed income/expense; pagination at bottom. | May 2026 dataset. | The core CRUD surface; examiners verify CRUD is implemented. |
| **10** | Transactions — Add Form Filled | `/transactions`, click Add, fill the form | Add form with type=Expense, category=Food, amount=₹450, date=today, description="Lunch at Cafe Coffee Day" filled in; Submit button highlighted. | Form filled, not yet submitted. | Demonstrates the data-entry path. |
| **11** | Transactions — Edit Modal | `/transactions`, click ✎ on any row | Edit Transaction modal overlay, pre-filled with the row's data; Save and Cancel buttons. | Pick a Zomato expense to edit. | Documents the edit flow. |
| **12** | Transactions — Delete Undo Toast | `/transactions`, click 🗑 on any row | Row visibly faded; toast at bottom-right with "Transaction deleted" text and an "Undo" button. | — | Demonstrates the polished undo pattern and toast UX. |
| **13** | Transactions — Filters Applied | `/transactions`, set type=Expense, category=Food, month=May 2026 | Filter chips visible, list filtered to Food expenses only, "Clear filters" button visible. | Filtered subset (~ 3 rows). | Demonstrates the filter system end-to-end. |
| **14** | Transactions — Filter Empty State | `/transactions`, filter that returns zero rows (e.g. type=Income, category=Food, month=May) | Polished empty state with Filter icon, "No transactions match your filters", and a "Clear filters" CTA. | Filter combo returning no rows. | Differentiates "no data at all" from "no match" — strong UX evidence. |
| **15** | Transactions — Initial Empty State | `/transactions` for a brand-new user | Receipt icon, "No transactions yet", helper text pointing to the form above. No filter. | New user. | Pairs with #14 to show the **two** empty-state variants the project deliberately implements. |
| **16** | Transactions — Search in Action | `/transactions`, type "netflix" into the search box | Live-filtered list showing only Netflix-related rows; search input visible with the typed query. | — | Demonstrates the case-insensitive multi-field search. |
| **17** | Exported CSV File | After clicking "Export CSV" — show the downloaded file open in Excel/LibreOffice | The CSV opened in a spreadsheet app with header row (Date, Type, Category, Amount, Description) and 10–20 rows. | May 2026 export. | Proves the export feature actually works end-to-end; great for the deliverables section. |

### 3.4 Budgets

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **18** | Budgets — Populated with Mixed Statuses | `/budgets`, May 2026 | At least four budget cards showing all three statuses (one Exceeded red, one Warning amber, two Within Budget green); month + year selectors at the top; Add Budget button. | Budgets seed from §2. | Single most useful budgets screenshot — shows the threshold-warning system in one image. |
| **19** | Budgets — Create Modal | `/budgets`, click "Add Budget" | Modal with Category dropdown, Limit input, Alert threshold slider at 80 %, Cancel/Save buttons. | Empty form ready for input. | Documents the creation flow. |
| **20** | Budgets — Empty State | `/budgets`, March 2026 (no budgets set for March) | Centred empty-state card: PlusCircle icon, "No budgets for this month", "Create your first budget" CTA. | Choose a month with no budgets. | Demonstrates the per-month nature of the budget system. |

### 3.5 Savings Goals

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **21** | Goals — Active + Completed Sections | `/goals` | Two section headings ("Active Goals" and "Completed Goals"); three active cards with progress bars (40 %, 74 %), one completed card (Emergency Fund 100 % with green checkmark). | Goals seed from §2. | Demonstrates the bifurcated active/completed UX in a single image. |
| **22** | Goals — Contribute Modal | `/goals`, click the ➕ button on any active goal | Modal "Add to 🚗 New Bike" with amount input, Cancel/Add buttons. | Empty input. | Documents the contribution flow. |
| **23** | Goals — Create Modal | `/goals`, click "New Goal" | Modal with emoji picker grid, Goal Name, Target Amount, Deadline fields. | Emoji picker visible with 🎯 selected. | Highlights the emoji-icon picker which adds personality to the UI. |

### 3.6 Recurring Transactions

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **24** | Recurring — Active + Paused Sections | `/recurring` | Both section headers visible. At least three Active recurring cards (Salary, Netflix, Jio) with frequency badges and next-run dates. One Paused card (Gym) at reduced opacity. | Recurring seed from §2. | Shows the full feature in one image and demonstrates pause/resume UX. |
| **25** | Recurring — Create Modal | `/recurring`, click "Add Recurring" | Modal with Name, Type, Category, Amount, Frequency dropdown (showing Daily/Weekly/Monthly/Yearly), Next Run Date. | Fields ready to fill. | Documents the creation form, particularly the frequency enum. |
| **26** | Recurring — Empty State | `/recurring` for a user with no recurring entries | Polished empty state with RefreshCcw icon, "No recurring transactions yet", description text, and "Add your first one" CTA. | New user / clear all. | Shows the EmptyState component pattern in another module. |

### 3.7 Reports & Analytics

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **27** | Reports — Full Page (Light) | `/reports`, May 2026 | Three stat cards (Total Income / Total Expenses / Net Savings); Savings Rate card with progress bar; Expenses-by-Category donut chart; Monthly Trends line chart for 2026; Category Breakdown table with progress bars. | May 2026 / year 2026. | Single most data-dense screenshot of the project — anchor of the Reports chapter. |
| **28** | Reports — Full Page (Dark) | Same as #27, theme toggled | Identical content in dark theme; chart grid and axis colours adapted. | Same. | Demonstrates theme-aware Recharts integration. |
| **29** | Reports — Monthly Trends Close-up | `/reports`, screenshot just the Monthly Trends card | Year selector showing 2026; line chart with twelve months on X-axis, both Income and Expense lines, legend at bottom. | Year 2026 with months populated April / May. Note the densified zero months. | Highlights the "densified to all 12 months" UX touch that distinguishes the project. |
| **30** | Reports — Category Breakdown Close-up | `/reports`, screenshot just the Category Breakdown card | Table with colour-dot, category name, progress bar, total ₹, percentage — for 5–8 categories. | May 2026. | Documents the tabular analytics view next to the chart. |
| **31** | Reports — Empty Chart States | `/reports` for a month with no data (March 2026) | Empty state inside the chart card: PieIcon / LineIcon, "No expense data", description. | Empty month. | Pairs with #27 to show graceful empty handling in analytics. |

### 3.8 AI Financial Assistant

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **32** | AI Assistant — Full Page | `/ai-assistant`, just after running "Analyze Spending" | Left rail: Financial Health Score gauge with sub-score bars, Quick Actions (Analyse / Predict / Detect), Recommendations cards. Right rail: chat panel with the assistant's analysis message (Patterns / Concerns / Positives / Actions sections visible). | Full seed data. | The flagship AI screenshot — examiners specifically look for AI integration. |
| **33** | AI — Financial Health Score Gauge Close-up | `/ai-assistant`, screenshot just the Score card | Circular gauge showing a score (e.g. 72), band label ("Good"), four sub-score progress bars (Savings rate, Budget adherence, etc.). | Same seed. | Demonstrates the proprietary financial-health-score algorithm visually. |
| **34** | AI — Predict Next Month Output | `/ai-assistant`, click "Predict Next Month" and wait | Chat panel with two messages: the user's "What will my spending look like…" and the assistant's reply showing Predicted Income / Expenses / Savings / Biggest category figures. | Same. | Documents one of the structured AI outputs. |
| **35** | AI — Subscription Detection Output | `/ai-assistant`, click "Detect Subscriptions" | Chat panel showing the detected subscription list (Netflix ₹649 monthly, Jio ₹399 monthly, etc.) with monthly impact total at the bottom. | Same. | Documents another structured AI output. |
| **36** | AI — Free-form Chat (English) | `/ai-assistant`, ask "How much did I spend on Food in May?" | User question and a substantive assistant answer with figures pulled from data. | Same. | Demonstrates the free-form chat capability. |
| **37** | AI — Free-form Chat in Malayalam | Same, but with the app language switched to മലയാളം and a Malayalam question | Chat UI chrome in Malayalam; user message in Malayalam; assistant reply in Malayalam. | Same. | **Critical screenshot** that proves the AI is multilingual end-to-end (chrome + LLM output). |

### 3.9 SMS Import

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **38** | SMS Import — Initial Page | `/sms-import` | Page header; the blue "How it works" banner with description; the paste textarea; three "Example N" chips; "Parse SMS" button. | Clean state. | Documents the entry point of the headline feature. |
| **39** | SMS Import — After Parsing (Income SMS) | `/sms-import`, paste the SBI credit SMS, click Parse | The "Transaction Detected" green-left-border card showing Type = Credit (Income), Amount = ₹50,000, Category = Miscellaneous, Merchant = NEFT, Description preserving the SMS text. "Add Transaction" button visible. | SBI credit SMS from §2. | The hero screenshot of the SMS parsing feature — single most differentiating capability of the project. |
| **40** | SMS Import — Debit SMS Parsed | `/sms-import`, paste the HDFC Zomato debit SMS, click Parse | "Transaction Detected" card with Type = Debit (Expense), Amount = ₹1,500, Category = Food, Merchant = ZOMATO ORDER. | HDFC Zomato debit SMS. | Pairs with #39 to show both credit and debit handling. |
| **41** | SMS Import — Parse Error | `/sms-import`, paste a random non-financial SMS, click Parse | The red "banner-red" with "Could not detect a financial transaction in this SMS." | An OTP SMS or random text. | Demonstrates input-rejection / negative-path UX. |
| **42** | SMS Import — Offline Queue Banner | `/sms-import` after queuing two transactions offline | The yellow "pending sync" banner at the bottom: "2 transactions pending sync" with "Sync Now" button. | Offline queue with 2 items. | Demonstrates offline-first capability — a sophisticated UX touch. |

### 3.10 Localisation / Multi-Language

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **43** | Language Switcher Open | Header dropdown opened on any page | The 12-option language menu with native-script labels: English, हिन्दी, தமிழ், മലയാളം, ಕನ್ನಡ, తెలుగు, Français, Deutsch, Español, العربية, 日本語, 中文. | — | Single image proving 12-language support — high impact for the localisation chapter. |
| **44** | Dashboard in Malayalam | `/` with language=ml | The complete dashboard in Malayalam — page title, KPI labels, chart titles, table headers, sidebar items all in Malayalam script. | May 2026 data. | The most compelling localisation proof — examiners can read familiar layout in unfamiliar script. |
| **45** | Dashboard in Hindi | `/` with language=hi | Same as #44 but in Hindi. | Same data. | Provides a second-language proof point; more familiar to most Indian examiners than Malayalam. |
| **46** | Arabic RTL — Any Page | `/transactions` or `/dashboard` with language=ar | Layout mirrored: sidebar flipped to the right, text right-aligned, page subtitle in Arabic. | Same data. | Demonstrates RTL handling — a non-trivial cross-cutting concern. |
| **47** | Currency Switched to USD | `/dashboard` after switching `preferredCurrency` to USD | All ₹ values replaced with $ values. | Same data. | Demonstrates multi-currency formatting via `Intl.NumberFormat`. |

### 3.11 Settings

| # | Title | Page / Action | What must be visible | Sample data | Why it matters |
|---|---|---|---|---|---|
| **48** | Settings — Full Page (Top) | `/settings`, scrolled to top | Page header; Appearance section with Light/Dark theme buttons (Dark selected) and the Font picker grid (six fonts visible). | — | Shows the personalisation features. |
| **49** | Settings — Profile + Language & Currency | `/settings`, scrolled to middle | Profile Information card (Name, Email, Monthly Income) and Language & Currency card with both dropdowns visible. | Aarav Kumar profile. | Documents profile and preference management. |
| **50** | Settings — Change Password Form | `/settings`, scrolled to Change Password | Three password inputs (Current / New / Confirm) with the password validation hint visible ("Min. 6 characters"). | Empty form. | Documents security-related settings. |
| **51** | Settings — Danger Zone | `/settings`, scrolled to bottom | Red-bordered Danger Zone card with "Delete Account" button. | — | Documents the danger-action UX pattern. |

---

## 4. Cross-Cutting Screenshots

Capture once each — these illustrate qualities of the project that span all modules.

| # | Title | Capture target | What must be visible | Why it matters |
|---|---|---|---|---|
| **52** | Light vs Dark Side-by-Side | Take two clean captures of the Dashboard (one light, one dark) and place them side-by-side in the figure. | Identical dashboard in both modes. | Shows the theme system at a glance. |
| **53** | Mobile View — Dashboard | Open Chrome DevTools → toggle device toolbar → choose Pixel 7 → capture `/`. | Sidebar collapsed to drawer (hamburger visible); KPI cards stacked vertically; charts shrunk to fit. | Demonstrates mobile-first responsive design. |
| **54** | Mobile View — Transactions | Same as #53 but on `/transactions`. | List in scrollable form; filters stacked; search at top. | Demonstrates list-page responsiveness. |
| **55** | Mobile View — Sidebar Drawer Open | Mobile viewport, hamburger clicked. | Drawer overlay; full nav list visible. | Documents the mobile navigation pattern. |
| **56** | Android App — Home (Capacitor) | Capacitor Android build running on a physical phone or emulator. | The dashboard rendered inside the native shell with status bar / nav bar around it. | Proves the Android packaging actually works. |
| **57** | Android App — SMS Import | Capacitor Android build, SMS Import page. | Native shell + the SMS Import page identical to web. | Reinforces the "same code, two platforms" claim. |

---

## 5. Diagram Screenshots

These are not application screenshots but diagrams you should include. Create them in Excalidraw, draw.io, or Lucidchart and export as PNG.

| # | Title | Content | Where it goes |
|---|---|---|---|
| **58** | High-Level Architecture Diagram | Three-tier diagram: React SPA (web/Capacitor) → Express API → MongoDB; sidecar Redis + OpenRouter boxes. | Chapter 2 / Architecture section. |
| **59** | Authentication Flow Diagram | Sequence diagram: Login → tokens issued; protected request → 401 → silent refresh → retry; logout. | Chapter 9 / Security section. |
| **60** | ER Diagram | Boxes for User, Transaction, Budget, Goal, RecurringTransaction with cardinality lines as described in MASTER_CONTEXT.md §5.7. | Chapter 3 / Database Design section. |
| **61** | SMS Parsing Flowchart | The 8-step algorithm flow from `MASTER_CONTEXT.md §8.6`. | Chapter 8 / Algorithms section, near the SMS parser explanation. |
| **62** | Component / Folder Structure Tree | The folder tree from `MASTER_CONTEXT.md §4.8`. | Chapter 2 / Architecture appendix. |
| **63** | Dashboard Data Flow Diagram | Page mount → React Query → API → Redis cache check → Mongo `$facet` → JSON → KPI cards / charts. | Chapter 7 / Module Explanation. |

---

## 6. Placement in the Final Report

A B.Tech project report is typically structured into ~6–8 chapters. Map screenshots to chapters as follows.

### Chapter 1 — Introduction

Use screenshots that establish *what the project is* at a glance. Limit to 2–3 images so the chapter remains prose-heavy.

- **#04 Dashboard — Fully Populated (Light)** — as the frontispiece or first figure.
- **#39 SMS Import — After Parsing (Income SMS)** — to motivate the headline feature in the Problem Statement subsection.

### Chapter 2 — System Architecture / Proposed System

- **#58 High-Level Architecture Diagram** — primary anchor.
- **#62 Component / Folder Structure Tree** — secondary.

### Chapter 3 — Database Design

- **#60 ER Diagram** — primary anchor.
- Optionally a screenshot of MongoDB Compass showing the populated `transactions` collection if your guide values it.

### Chapter 4 — Snapshots / Implementation Results

This is the **main visual chapter**. Include 25–30 screenshots organised by module. Recommended set:

| Section | Screenshots |
|---|---|
| 4.1 Authentication | #01, #02, #03 |
| 4.2 Dashboard | #04, #05 (paired), #06, #07 |
| 4.3 Transactions | #09, #10, #11, #12, #13, #14, #15, #16, #17 |
| 4.4 Budgets | #18, #19, #20 |
| 4.5 Goals | #21, #22, #23 |
| 4.6 Recurring | #24, #25, #26 |
| 4.7 Reports | #27, #28 (paired), #29, #30, #31 |
| 4.8 AI Assistant | #32, #33, #34, #35, #36, #37 |
| 4.9 SMS Import | #38, #39, #40, #41, #42 |
| 4.10 Settings | #48, #49, #50, #51 |

That gives a healthy ~40 figures across Chapter 4 — substantive but not bloated.

### Chapter 5 — UI/UX, Localisation & Responsive Design

Group the cross-cutting and localisation screenshots here so they're a separate narrative thread, not buried inside individual module sections.

- **#43 Language Switcher Open** — anchor.
- **#44 Dashboard in Malayalam** + **#45 Dashboard in Hindi** — side-by-side figure.
- **#46 Arabic RTL** — single figure.
- **#47 Currency Switched to USD** — single figure.
- **#52 Light vs Dark Side-by-Side** — single figure.
- **#53–#55 Mobile Views** — composite figure.

### Chapter 6 — Algorithms & Logic

- **#61 SMS Parsing Flowchart** — primary anchor.
- **#33 Financial Health Score Gauge Close-up** — secondary visual.

### Chapter 7 — Security

- **#59 Authentication Flow Diagram** — primary anchor.
- **#03 Login Validation Error** — to demonstrate the validation layer.

### Chapter 8 — Deployment

- **#56 Android App — Home** + **#57 Android App — SMS Import** — composite figure.

### Chapter 9 — Conclusion & Future Work

No new screenshots needed; reuse the Dashboard hero (#04) as a closing image if your template encourages it.

---

## 7. Placement in the Viva PPT

A typical viva presentation is 12–18 slides. Use screenshots strategically — one or two per slide, never a wall of thumbnails.

| Slide | Content | Screenshot |
|---|---|---|
| 1 | Title slide | None (or app logo). |
| 2 | Problem Statement | None — text only. |
| 3 | Proposed Solution (one-sentence pitch) | **#04 Dashboard — Light** as the supporting visual. |
| 4 | Tech Stack | Logo grid; no app screenshots. |
| 5 | Architecture | **#58 High-Level Architecture Diagram**. |
| 6 | Database Design | **#60 ER Diagram**. |
| 7 | Module Demo — Transactions | **#09 + #13** (populated + filtered) as a two-pane figure. |
| 8 | Module Demo — Budgets | **#18 Budgets — Mixed Statuses**. |
| 9 | Module Demo — Goals & Recurring | **#21 + #24** combined. |
| 10 | Module Demo — Reports | **#27 Reports — Full Page**. |
| 11 | Module Demo — AI Assistant | **#32 AI — Full Page**. |
| 12 | Module Demo — SMS Import | **#39 SMS Import — After Parsing** (the **hero feature**). |
| 13 | Cross-cutting — Dark mode + Mobile | **#52 + #53** composite. |
| 14 | Cross-cutting — Localisation | **#43 + #44 + #46** triptych: switcher + Malayalam + Arabic. |
| 15 | Cross-cutting — Android | **#56 Android App Home**. |
| 16 | Security & Validation Highlights | **#59 Auth Flow Diagram**. |
| 17 | Future Enhancements | None — bullet list. |
| 18 | Thank-You / Q&A | App logo. |

**Slides to absolutely include because they are the "wow" frames:** #04, #18, #27, #32, **#39 (most differentiating)**, #44, #56.

---

## 8. Capture Order (Efficient Batch Workflow)

To minimise login/seed/teardown overhead, follow this order in a single capture session:

### Session A — Light, English, Desktop (1440 × 900), Aarav Kumar fully populated

1. `/login` → #01 (also use this user's login)
2. `/register` → #02 (second tab, fresh)
3. `/login` with bad password → #03
4. `/` → #04, #07, #08
5. `/transactions` → #09, #16
6. Open Add form → #10
7. Edit modal → #11
8. Delete + undo → #12
9. Apply filters → #13
10. Filter that returns 0 → #14
11. `/budgets` → #18
12. Open Add Budget → #19
13. `/goals` → #21
14. Open Contribute → #22, Open New Goal → #23
15. `/recurring` → #24, Open New Recurring → #25
16. `/reports`, May 2026 → #27, #29, #30
17. `/reports`, March 2026 (no data) → #31
18. `/ai-assistant` → run Analyse → #32, #33
19. Run Predict → #34
20. Run Detect Subscriptions → #35
21. Ask a free-form question → #36
22. `/sms-import` → #38
23. Paste & parse SBI credit → #39
24. Paste & parse HDFC Zomato → #40
25. Paste random text → #41
26. `/settings` → #48, #49, #50, #51

### Session B — Dark Mode (Theme toggled, same Aarav user)

1. `/` → #05
2. `/reports` → #28

### Session C — Empty States (New User "Priya Singh")

1. `/transactions` → #15
2. `/` → #06
3. `/budgets` (March, no budgets) → #20
4. `/recurring` → #26

### Session D — Localisation

1. Header → switch to Malayalam → capture switcher mid-open → #43
2. `/` in Malayalam → #44
3. Switch to Hindi → `/` → #45
4. Switch to Arabic → `/transactions` → #46
5. Switch back to English, change currency to USD → `/` → #47

### Session E — AI in Malayalam

1. Switch to Malayalam → `/ai-assistant` → ask a question in Malayalam → #37

### Session F — Offline Queue

1. Toggle airplane mode → `/sms-import` → parse + save twice → #42
2. Restore network.

### Session G — Mobile (DevTools device toolbar, Pixel 7)

1. `/` → #53
2. `/transactions` → #54
3. Tap hamburger → #55

### Session H — Android (Physical or Emulator)

1. Build with `npm run build && npx cap sync android && npx cap open android`.
2. Run on emulator/device.
3. Screenshot `/` → #56
4. Screenshot `/sms-import` → #57

### Session I — Diagrams

Produce in Excalidraw or draw.io:
- #58 Architecture, #59 Auth flow, #60 ER, #61 SMS parsing flowchart, #62 Folder tree (can also be a code-style screenshot of the directory in VS Code), #63 Dashboard data flow.

### Session J — Deliverable file

After Session A step 9 in the export flow, save the CSV → open in Excel → screenshot → #17.

---

## Summary

- **Total screenshots:** 51 application screenshots + 6 diagrams = **57 figures**.
- **For the report's Snapshots chapter (Chapter 4):** the ~ 40 module screenshots listed in §6.
- **For the Introduction / Proposed System:** #04 + #39 (the hero pair).
- **For the Viva PPT:** the 13-slide-worth of curated frames listed in §7 — especially #04, #18, #27, #32, **#39**, #44, #56.
- **What makes the project look strong:** the deliberate empty-state pairs (#14 vs #15), the dark-mode parity (#04 vs #05, #27 vs #28), the localisation triptych (#43 + #44 + #46), and the SMS-parsing flagship (#39 + #42).

Avoid these redundant captures: the same form before and after submission (one is enough); separate screenshots for each language (the Malayalam dashboard alone is sufficient to prove the case); login + logout button (the login page is sufficient).

Treat this checklist as a **capture script**: tick each item off as you go and your final report will look polished, complete, and academically appropriate without any padding.
