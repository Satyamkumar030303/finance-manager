/**
 * ML / AI Service — OpenRouter provider abstraction
 * Finance analysis: deepseek/deepseek-chat
 * Chat + multilingual + SMS: qwen/qwen-2.5-7b-instruct
 */
const axios = require("axios");
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const financialScore = require("../utils/financialScore");
const mongoose = require("mongoose");
const logger = require("../config/logger");

// ─── Model Config ─────────────────────────────────────────────────────────────

const FINANCE_MODEL = process.env.DEEPSEEK_MODEL || "deepseek/deepseek-chat";
const CHAT_MODEL = process.env.QWEN_MODEL || "qwen/qwen-2.5-7b-instruct";

// ─── OpenRouter Provider ──────────────────────────────────────────────────────

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", fr: "French", de: "German",
  es: "Spanish", ta: "Tamil", ml: "Malayalam", kn: "Kannada",
  te: "Telugu", ar: "Arabic", zh: "Chinese", ja: "Japanese",
};

async function callOpenRouter(systemPrompt, userMessage, opts = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const model = opts.model || CHAT_MODEL;

  // Prepend language instruction when a non-English language is requested
  let finalSystemPrompt = systemPrompt;
  if (opts.language && opts.language !== "en") {
    const langName = LANGUAGE_NAMES[opts.language] || opts.language;
    finalSystemPrompt = `IMPORTANT: Always respond in ${langName}. All text in your response must be in ${langName}.\n\n${systemPrompt}`;
  }

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      max_tokens: opts.maxTokens || 1024,
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: userMessage },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
        "X-Title": "FinanceManager",
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0].message.content;
}

// ─── JSON Extraction ──────────────────────────────────────────────────────────
// LLMs often wrap JSON in markdown code blocks. Extract cleanly.

function extractJSON(text) {
  if (!text) return null;

  // 1. Direct parse
  try { return JSON.parse(text); } catch { /* continue */ }

  // 2. Strip ```json ... ``` or ``` ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch { /* continue */ }
  }

  // 3. Extract first {...} or [...]
  const obj = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (obj) {
    try { return JSON.parse(obj[1]); } catch { /* continue */ }
  }

  return null;
}

// ─── Context Builder ──────────────────────────────────────────────────────────

async function buildUserContext(userId) {
  const oid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [transactions, budgets] = await Promise.all([
    Transaction.find({ user: oid, transactionDate: { $gte: ninetyDaysAgo } })
      .sort({ transactionDate: -1 })
      .limit(100),
    Budget.find({
      user: oid,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const categoryBreakdown = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryBreakdown[t.category] =
        (categoryBreakdown[t.category] || 0) + t.amount;
    });

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`);

  return {
    transactions,
    budgets,
    summary: {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate:
        totalIncome > 0
          ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
          : 0,
    },
    topCategories,
    categoryBreakdown,
    budgetCount: budgets.length,
  };
}

const SYSTEM_PROMPT = `You are FinanceAI, a personal finance assistant for an Indian finance management app.
You analyze users' transaction data and provide practical, actionable financial advice.
Be concise, friendly, and specific. Use INR (₹) formatting.
Avoid generic advice — always reference the user's actual data.
Never recommend specific stocks, mutual funds by name, or make promises about returns.
Keep responses under 300 words unless asked for detailed analysis.`;

// ─── Fallback Helpers ─────────────────────────────────────────────────────────

const AI_UNAVAILABLE_MESSAGE =
  "AI assistant temporarily unavailable. Please try again later.";

function logProviderFailure(fn, err) {
  logger.error(`[AI] ${fn} failed: ${err.message}`, {
    code: err.response?.status,
    data: err.response?.data,
  });
}

// ─── Phase 1: Core AI ─────────────────────────────────────────────────────────

exports.chat = async (userId, message, history = [], language = "en") => {
  const ctx = await buildUserContext(userId);

  const contextSummary = `
User Financial Summary (last 90 days):
- Total Income: ₹${ctx.summary.totalIncome.toFixed(0)}
- Total Expenses: ₹${ctx.summary.totalExpense.toFixed(0)}
- Net Savings: ₹${ctx.summary.netSavings.toFixed(0)}
- Savings Rate: ${ctx.summary.savingsRate}%
- Top spending categories: ${ctx.topCategories.join(", ") || "No data"}
- Active budgets: ${ctx.budgetCount}
`;

  const conversationContext =
    history.length > 0
      ? "Previous conversation:\n" +
        history.map((m) => `${m.role}: ${m.content}`).join("\n") +
        "\n\n"
      : "";

  const userMessage = `${contextSummary}\n${conversationContext}User question: ${message}`;

  try {
    return await callOpenRouter(SYSTEM_PROMPT, userMessage, {
      model: CHAT_MODEL,
      maxTokens: 512,
      language,
    });
  } catch (err) {
    logProviderFailure("chat", err);
    return AI_UNAVAILABLE_MESSAGE;
  }
};

exports.analyzeSpending = async (userId, language = "en") => {
  const ctx = await buildUserContext(userId);

  const prompt = `Analyze this user's spending data.

Income: ₹${ctx.summary.totalIncome.toFixed(0)}
Expenses: ₹${ctx.summary.totalExpense.toFixed(0)}
Savings Rate: ${ctx.summary.savingsRate}%
Top categories: ${ctx.topCategories.join(", ")}

Return ONLY a raw JSON object (no markdown, no explanation):
{"patterns":["..."],"concerns":["..."],"positives":["..."],"actions":["..."]}

patterns: 2-3 key spending observations
concerns: areas that need attention
positives: good financial habits
actions: 2 specific actionable improvements`;

  try {
    const response = await callOpenRouter(SYSTEM_PROMPT, prompt, {
      model: FINANCE_MODEL,
      maxTokens: 800,
      language,
    });
    const parsed = extractJSON(response);
    return parsed || { raw: response };
  } catch (err) {
    logProviderFailure("analyzeSpending", err);
    return { unavailable: true, message: AI_UNAVAILABLE_MESSAGE };
  }
};

exports.getRecommendations = async (userId) => {
  const [ctx, score] = await Promise.all([
    buildUserContext(userId),
    financialScore.calculate(userId),
  ]);

  const prompt = `User Financial Score: ${score.score}/100 (${score.band})
Score breakdown: ${JSON.stringify(score.breakdown)}
Income: ₹${ctx.summary.totalIncome.toFixed(0)}, Expenses: ₹${ctx.summary.totalExpense.toFixed(0)}
Top spending: ${ctx.topCategories.join(", ")}

Return ONLY a raw JSON array (no markdown, no explanation):
[{"title":"...","description":"...","priority":"high|medium|low","category":"savings|budgeting|debt|investment|emergency","estimatedSavings":"..."}]

Provide exactly 5 personalized recommendations based on the data above.`;

  try {
    const response = await callOpenRouter(SYSTEM_PROMPT, prompt, {
      model: FINANCE_MODEL,
      maxTokens: 1024,
    });
    const parsed = extractJSON(response);
    if (Array.isArray(parsed)) return parsed;
    if (parsed) return [parsed];
    return [
      {
        title: "Financial Tips",
        description: response,
        priority: "medium",
        category: "savings",
        estimatedSavings: "Varies",
      },
    ];
  } catch (err) {
    logProviderFailure("getRecommendations", err);
    return [
      {
        title: "Recommendations Unavailable",
        description: AI_UNAVAILABLE_MESSAGE,
        priority: "low",
        category: "savings",
        estimatedSavings: "0",
      },
    ];
  }
};

exports.predictNextMonth = async (userId) => {
  const ctx = await buildUserContext(userId);
  const monthlyExpense = ctx.summary.totalExpense / 3;

  const categoryPredictions = {};
  ctx.transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!categoryPredictions[t.category]) categoryPredictions[t.category] = 0;
      categoryPredictions[t.category] += t.amount / 3;
    });

  return {
    predictedTotal: Math.round(monthlyExpense),
    predictedIncome: Math.round(ctx.summary.totalIncome / 3),
    byCategory: Object.entries(categoryPredictions)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => ({ ...acc, [k]: Math.round(v) }), {}),
    note: "Based on 90-day average",
  };
};

exports.detectSubscriptions = async (userId) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await Transaction.find({
    user: oid,
    type: "expense",
    transactionDate: { $gte: sixMonthsAgo },
  }).sort({ transactionDate: -1 });

  // Group by (category + amount bucket) to detect recurring payments
  const groups = {};
  transactions.forEach((t) => {
    const amountBucket = Math.round(t.amount / 10) * 10;
    const descKey = t.description
      ? t.description.toLowerCase().substring(0, 20).trim()
      : "";
    const key = `${t.category}-${amountBucket}-${descKey}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  return Object.values(groups)
    .filter((g) => g.length >= 2)
    .map((g) => {
      const sorted = [...g].sort(
        (a, b) => b.transactionDate - a.transactionDate
      );
      // Estimate monthly frequency
      const daysBetween =
        g.length >= 2
          ? (sorted[0].transactionDate - sorted[sorted.length - 1].transactionDate) /
            (1000 * 60 * 60 * 24 * (g.length - 1))
          : null;

      return {
        category: g[0].category,
        amount: g[0].amount,
        description: g[0].description,
        occurrences: g.length,
        lastDate: sorted[0].transactionDate,
        estimatedFrequency:
          daysBetween !== null
            ? daysBetween < 10
              ? "weekly"
              : daysBetween < 35
              ? "monthly"
              : "irregular"
            : "unknown",
        monthlyImpact: Math.round(
          daysBetween && daysBetween > 0 ? (g[0].amount * 30) / daysBetween : g[0].amount
        ),
      };
    })
    .sort((a, b) => b.monthlyImpact - a.monthlyImpact)
    .slice(0, 10);
};

exports.parseSMS = async (smsText, sender = "") => {
  const regexResult = parseWithRegex(smsText);
  if (regexResult) return regexResult;

  const prompt = `Parse this SMS and extract financial transaction details if present.
SMS: "${smsText}"
Sender: "${sender}"

Return ONLY raw JSON (no markdown):
If financial: {"isFinancial":true,"type":"income|expense","amount":number,"category":"...","merchant":"...|null","description":"..."}
If not financial: {"isFinancial":false}

Categories: Food, Transport, Shopping, Entertainment, Utilities, Health, Education, Finance, Telecom, Travel, Salary, Miscellaneous`;

  try {
    const response = await callOpenRouter(
      "You are an SMS parser for Indian banking messages. Extract financial data accurately.",
      prompt,
      { model: CHAT_MODEL, maxTokens: 256 }
    );
    return extractJSON(response) || { isFinancial: false };
  } catch (err) {
    logProviderFailure("parseSMS", err);
    return { isFinancial: false };
  }
};

exports.testConnection = async () => {
  const response = await callOpenRouter(
    "You are a helpful assistant.",
    'Reply with exactly: {"status":"ok","provider":"openrouter"}',
    { model: CHAT_MODEL, maxTokens: 64 }
  );
  return response;
};

// ─── Phase 2: Enhanced AI Features ───────────────────────────────────────────

/**
 * Budget advice — compare actual spending against budget limits.
 */
exports.getBudgetAdvice = async (userId) => {
  const ctx = await buildUserContext(userId);

  if (ctx.budgets.length === 0) {
    return {
      hasBudgets: false,
      message: "No budgets set for this month. Set budgets to get personalized advice.",
      categories: [],
    };
  }

  // Build budget vs actual comparison
  const comparison = ctx.budgets.map((b) => {
    const spent = ctx.categoryBreakdown[b.category] || 0;
    const limit = b.amount;
    const pct = limit > 0 ? ((spent / limit) * 100).toFixed(0) : 0;
    const status =
      spent > limit ? "over" : spent > limit * 0.85 ? "warning" : "ok";
    return {
      category: b.category,
      budgeted: limit,
      spent: Math.round(spent),
      remaining: Math.round(Math.max(0, limit - spent)),
      percentUsed: Number(pct),
      status,
    };
  });

  const overBudget = comparison.filter((c) => c.status === "over");
  const nearLimit = comparison.filter((c) => c.status === "warning");

  // Only call LLM if there are notable issues
  let advice = null;
  if (overBudget.length > 0 || nearLimit.length > 0) {
    const prompt = `The user has budget issues this month.

Over budget: ${overBudget.map((c) => `${c.category} (spent ₹${c.spent} of ₹${c.budgeted})`).join(", ")}
Near limit: ${nearLimit.map((c) => `${c.category} (${c.percentUsed}% used)`).join(", ")}
Total income: ₹${ctx.summary.totalIncome.toFixed(0)}

Give 2-3 specific, actionable suggestions to get back on track this month. Be brief and practical.`;

    try {
      advice = await callOpenRouter(SYSTEM_PROMPT, prompt, {
        model: CHAT_MODEL,
        maxTokens: 300,
      });
    } catch (err) {
      logProviderFailure("getBudgetAdvice", err);
    }
  }

  return {
    hasBudgets: true,
    categories: comparison,
    summary: {
      total: comparison.length,
      overBudget: overBudget.length,
      nearLimit: nearLimit.length,
      onTrack: comparison.filter((c) => c.status === "ok").length,
    },
    advice: advice || null,
  };
};

/**
 * Monthly financial report — structured summary for current month.
 */
exports.getMonthlyReport = async (userId) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonth, lastMonth, budgets] = await Promise.all([
    Transaction.find({
      user: oid,
      transactionDate: { $gte: startOfMonth },
    }).sort({ transactionDate: -1 }),
    Transaction.find({
      user: oid,
      transactionDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    Budget.find({
      user: oid,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  ]);

  const calcTotals = (txns) => ({
    income: txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expense: txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  });

  const current = calcTotals(thisMonth);
  const previous = calcTotals(lastMonth);

  const categorySpend = {};
  thisMonth
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    });

  const topExpenses = [...thisMonth]
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
      date: t.transactionDate,
    }));

  const savingsRate =
    current.income > 0
      ? (((current.income - current.expense) / current.income) * 100).toFixed(1)
      : 0;

  const incomeChange =
    previous.income > 0
      ? (((current.income - previous.income) / previous.income) * 100).toFixed(1)
      : null;
  const expenseChange =
    previous.expense > 0
      ? (((current.expense - previous.expense) / previous.expense) * 100).toFixed(1)
      : null;

  // Budget adherence for this month
  const budgetStatus = budgets.map((b) => {
    const spent = categorySpend[b.category] || 0;
    return {
      category: b.category,
      budgeted: b.amount,
      spent: Math.round(spent),
      adherence: b.amount > 0 ? Math.min(100, ((spent / b.amount) * 100)).toFixed(0) : 0,
    };
  });

  // AI narrative summary
  let narrative = null;
  const prompt = `Write a short 2-3 sentence financial summary for this month's report.

Month: ${now.toLocaleString("default", { month: "long", year: "numeric" })}
Income: ₹${current.income.toFixed(0)} (${incomeChange !== null ? `${incomeChange > 0 ? "+" : ""}${incomeChange}% vs last month` : "no prior data"})
Expenses: ₹${current.expense.toFixed(0)} (${expenseChange !== null ? `${expenseChange > 0 ? "+" : ""}${expenseChange}% vs last month` : "no prior data"})
Net savings: ₹${(current.income - current.expense).toFixed(0)}
Savings rate: ${savingsRate}%
Top expense category: ${Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}

Be encouraging if savings rate is positive, supportive if negative.`;

  try {
    narrative = await callOpenRouter(SYSTEM_PROMPT, prompt, {
      model: CHAT_MODEL,
      maxTokens: 200,
    });
  } catch (err) {
    logProviderFailure("getMonthlyReport", err);
  }

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    monthName: now.toLocaleString("default", { month: "long" }),
    income: Math.round(current.income),
    expense: Math.round(current.expense),
    netSavings: Math.round(current.income - current.expense),
    savingsRate: Number(savingsRate),
    transactionCount: thisMonth.length,
    categoryBreakdown: Object.entries(categorySpend)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => ({ ...acc, [k]: Math.round(v) }), {}),
    topExpenses,
    budgetStatus,
    comparison: {
      incomeChange: incomeChange !== null ? Number(incomeChange) : null,
      expenseChange: expenseChange !== null ? Number(expenseChange) : null,
      previousIncome: Math.round(previous.income),
      previousExpense: Math.round(previous.expense),
    },
    narrative: narrative || null,
  };
};

/**
 * Financial insights — combined score + spending + trend analysis.
 */
exports.getFinancialInsights = async (userId) => {
  const [ctx, score] = await Promise.all([
    buildUserContext(userId),
    financialScore.calculate(userId),
  ]);

  // Compute month-over-month trend from the 90-day window
  const now = new Date();
  const monthBuckets = {};
  ctx.transactions.forEach((t) => {
    const key = `${t.transactionDate.getFullYear()}-${String(t.transactionDate.getMonth() + 1).padStart(2, "0")}`;
    if (!monthBuckets[key]) monthBuckets[key] = { income: 0, expense: 0 };
    monthBuckets[key][t.type] = (monthBuckets[key][t.type] || 0) + t.amount;
  });

  const monthlyTrend = Object.entries(monthBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: Math.round(data.income),
      expense: Math.round(data.expense),
      savings: Math.round(data.income - data.expense),
    }));

  // Spending velocity (this month vs average)
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthData = monthBuckets[currentMonthKey] || { income: 0, expense: 0 };
  const avgMonthlyExpense = monthlyTrend.length > 1
    ? monthlyTrend.slice(0, -1).reduce((s, m) => s + m.expense, 0) / (monthlyTrend.length - 1)
    : 0;

  const spendingVelocity =
    avgMonthlyExpense > 0
      ? (((currentMonthData.expense - avgMonthlyExpense) / avgMonthlyExpense) * 100).toFixed(1)
      : 0;

  const prompt = `Based on this financial data, provide 3-4 concise insights (each max 1 sentence).

Financial Score: ${score.score}/100 (${score.band})
Savings Rate: ${ctx.summary.savingsRate}%
Spending this month vs average: ${spendingVelocity > 0 ? "+" : ""}${spendingVelocity}%
Top categories: ${ctx.topCategories.slice(0, 3).join(", ")}

Return ONLY a raw JSON array of strings (no markdown):
["insight 1", "insight 2", "insight 3"]`;

  let insights = [];
  try {
    const response = await callOpenRouter(SYSTEM_PROMPT, prompt, {
      model: FINANCE_MODEL,
      maxTokens: 400,
    });
    const parsed = extractJSON(response);
    insights = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    logProviderFailure("getFinancialInsights", err);
  }

  return {
    score: score.score,
    band: score.band,
    emoji: score.emoji,
    breakdown: score.breakdown,
    tips: score.tips,
    monthlyTrend,
    spendingVelocity: Number(spendingVelocity),
    topCategories: ctx.topCategories,
    insights,
  };
};

// ─── Regex SMS Parser ─────────────────────────────────────────────────────────

function parseWithRegex(sms) {
  const text = sms.toLowerCase();

  const amountPatterns = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹)/i,
  ];
  let amount = null;
  for (const p of amountPatterns) {
    const m = sms.match(p);
    if (m) {
      amount = parseFloat(m[1].replace(/,/g, ""));
      break;
    }
  }
  if (!amount || amount <= 0) return null;

  const isCredit =
    /credited|received|salary|refund|cashback|bonus|income/i.test(text);
  const isDebit =
    /debited|paid|payment|deducted|charged|spent|purchase|withdraw/i.test(text);

  if (!isCredit && !isDebit) return null;

  return {
    isFinancial: true,
    type: isCredit ? "income" : "expense",
    amount,
    category: detectCategory(text),
    merchant: detectMerchant(sms),
    description: sms.substring(0, 100),
  };
}

function detectCategory(text) {
  const mappings = [
    { keywords: ["swiggy", "zomato", "food", "restaurant", "hotel", "cafe", "eat"], category: "Food" },
    { keywords: ["uber", "ola", "rapido", "petrol", "fuel", "auto", "metro", "bus", "train", "irctc"], category: "Transport" },
    { keywords: ["amazon", "flipkart", "myntra", "shopping", "store", "mall", "purchase"], category: "Shopping" },
    { keywords: ["netflix", "spotify", "youtube", "hotstar", "prime", "subscription", "entertainment"], category: "Entertainment" },
    { keywords: ["electricity", "water", "gas", "bill", "utility", "broadband", "internet"], category: "Utilities" },
    { keywords: ["hospital", "pharmacy", "medicine", "doctor", "clinic", "health", "apollo"], category: "Health" },
    { keywords: ["school", "college", "tuition", "education", "course", "fees"], category: "Education" },
    { keywords: ["emi", "loan", "credit card", "mortgage", "repayment"], category: "Finance" },
    { keywords: ["recharge", "mobile", "dth", "jio", "airtel", "vi", "bsnl"], category: "Telecom" },
    { keywords: ["flight", "hotel", "travel", "makemytrip", "goibibo", "oyo"], category: "Travel" },
    { keywords: ["salary", "credited", "stipend", "income", "payroll"], category: "Salary" },
  ];

  for (const { keywords, category } of mappings) {
    if (keywords.some((k) => text.includes(k))) return category;
  }
  return "Miscellaneous";
}

function detectMerchant(sms) {
  const patterns = [
    /(?:at|to|from|via)\s+([A-Z][a-zA-Z\s]{2,20})/,
    /(?:merchant:|purchase at)\s*([A-Za-z\s]{2,25})/i,
  ];
  for (const p of patterns) {
    const m = sms.match(p);
    if (m) return m[1].trim();
  }
  return null;
}
