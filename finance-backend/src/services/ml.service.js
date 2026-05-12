/**
 * ML / AI Service
 * LLM-agnostic abstraction layer — supports Claude (Anthropic) and OpenAI.
 * Switch provider via AI_PROVIDER env var: "claude" | "openai"
 */
const axios = require("axios");
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const financialScore = require("../utils/financialScore");
const mongoose = require("mongoose");

// ─── Provider Abstraction ─────────────────────────────────────────────────────

async function callLLM(systemPrompt, userMessage, opts = {}) {
  const provider = (process.env.AI_PROVIDER || "claude").toLowerCase();

  if (provider === "openai") {
    return callOpenAI(systemPrompt, userMessage, opts);
  }
  return callClaude(systemPrompt, userMessage, opts);
}

async function callClaude(systemPrompt, userMessage, opts = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: opts.model || "claude-haiku-4-5-20251001",
      max_tokens: opts.maxTokens || 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    },
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      timeout: 30000,
    }
  );

  return response.data.content[0].text;
}

async function callOpenAI(systemPrompt, userMessage, opts = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: opts.model || "gpt-4o-mini",
      max_tokens: opts.maxTokens || 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0].message.content;
}

// ─── Context Builder ──────────────────────────────────────────────────────────

async function buildUserContext(userId) {
  const oid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [transactions, budgets] = await Promise.all([
    Transaction.find({ user: oid, transactionDate: { $gte: threeMonthsAgo } })
      .sort({ transactionDate: -1 })
      .limit(100),
    Budget.find({
      user: oid,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  ]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categoryBreakdown = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
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
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
    },
    topCategories,
    budgetCount: budgets.length,
  };
}

const SYSTEM_PROMPT = `You are FinanceAI, a personal finance assistant for an Indian finance management app.
You analyze users' transaction data and provide practical, actionable financial advice.
Be concise, friendly, and specific. Use INR (₹) formatting.
Avoid generic advice — always reference the user's actual data.
Never recommend specific stocks, mutual funds by name, or make promises about returns.
Keep responses under 300 words unless asked for detailed analysis.`;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Chat with the AI assistant.
 * @param {string} userId
 * @param {string} message - User's question
 * @param {Array} history - Previous messages [{role, content}]
 */
exports.chat = async (userId, message, history = []) => {
  const ctx = await buildUserContext(userId);

  const contextSummary = `
User Financial Summary (last 3 months):
- Total Income: ₹${ctx.summary.totalIncome.toFixed(0)}
- Total Expenses: ₹${ctx.summary.totalExpense.toFixed(0)}
- Net Savings: ₹${ctx.summary.netSavings.toFixed(0)}
- Savings Rate: ${ctx.summary.savingsRate}%
- Top spending categories: ${ctx.topCategories.join(", ") || "No data"}
- Active budgets: ${ctx.budgetCount}
`;

  const conversationContext = history.length > 0
    ? "Previous conversation:\n" + history.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n\n"
    : "";

  const userMessage = `${contextSummary}\n${conversationContext}User question: ${message}`;

  return callLLM(SYSTEM_PROMPT, userMessage, { maxTokens: 512 });
};

/**
 * Get AI-generated spending analysis.
 */
exports.analyzeSpending = async (userId) => {
  const ctx = await buildUserContext(userId);

  const prompt = `
Analyze this user's spending data and provide insights:

Income: ₹${ctx.summary.totalIncome.toFixed(0)}
Expenses: ₹${ctx.summary.totalExpense.toFixed(0)}
Savings Rate: ${ctx.summary.savingsRate}%
Top categories: ${ctx.topCategories.join(", ")}

Provide:
1. Key spending patterns (2-3 observations)
2. Areas of concern
3. Positive habits to maintain
4. 2 specific actionable improvements

Format as JSON: { patterns: [], concerns: [], positives: [], actions: [] }`;

  const response = await callLLM(SYSTEM_PROMPT, prompt, { maxTokens: 800 });
  try {
    return JSON.parse(response);
  } catch {
    return { raw: response };
  }
};

/**
 * Get personalized recommendations.
 */
exports.getRecommendations = async (userId) => {
  const [ctx, score] = await Promise.all([
    buildUserContext(userId),
    financialScore.calculate(userId),
  ]);

  const prompt = `
User Financial Score: ${score.score}/100 (${score.band})
Score breakdown: ${JSON.stringify(score.breakdown)}
Income: ₹${ctx.summary.totalIncome.toFixed(0)}, Expenses: ₹${ctx.summary.totalExpense.toFixed(0)}
Top spending: ${ctx.topCategories.join(", ")}

Provide 5 personalized, specific financial recommendations.
Format as JSON array: [{ title, description, priority, category, estimatedSavings }]
priority: "high" | "medium" | "low"
category: "savings" | "budgeting" | "debt" | "investment" | "emergency"`;

  const response = await callLLM(SYSTEM_PROMPT, prompt, { maxTokens: 1024 });
  try {
    return JSON.parse(response);
  } catch {
    return [{ title: "Financial Tips", description: response, priority: "medium", category: "savings" }];
  }
};

/**
 * Predict next month's spending.
 */
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
    note: "Based on 3-month average",
  };
};

/**
 * Detect subscription-like recurring expenses.
 */
exports.detectSubscriptions = async (userId) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await Transaction.find({
    user: oid,
    type: "expense",
    transactionDate: { $gte: sixMonthsAgo },
  });

  // Group by description similarity and similar amounts
  const groups = {};
  transactions.forEach((t) => {
    const key = `${t.category}-${Math.round(t.amount / 10) * 10}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const subscriptions = Object.values(groups)
    .filter((g) => g.length >= 2)
    .map((g) => ({
      category: g[0].category,
      amount: g[0].amount,
      description: g[0].description,
      occurrences: g.length,
      lastDate: g.sort((a, b) => b.transactionDate - a.transactionDate)[0].transactionDate,
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  return subscriptions;
};

/**
 * Parse an SMS message and classify it as a financial transaction.
 * Returns null if the SMS is not financial.
 */
exports.parseSMS = async (smsText, sender = "") => {
  // Fast regex path — handles 90% of cases
  const regexResult = parseWithRegex(smsText);
  if (regexResult) return regexResult;

  // LLM fallback for ambiguous messages
  const prompt = `Parse this SMS and extract financial transaction details if present.
SMS: "${smsText}"
Sender: "${sender}"

If financial, return JSON: { isFinancial: true, type: "income"|"expense", amount: number, category: string, merchant: string|null, description: string }
If not financial, return: { isFinancial: false }

Categories: Food, Transport, Shopping, Entertainment, Utilities, Health, Education, Finance, Telecom, Travel, Salary, Miscellaneous`;

  const response = await callLLM(
    "You are an SMS parser for Indian banking messages. Extract financial data accurately.",
    prompt,
    { maxTokens: 256 }
  );

  try {
    return JSON.parse(response);
  } catch {
    return { isFinancial: false };
  }
};

// ─── Regex SMS Parser ─────────────────────────────────────────────────────────

function parseWithRegex(sms) {
  const text = sms.toLowerCase();

  // Extract amount
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

  // Determine type
  const isCredit =
    /credited|received|salary|refund|cashback|bonus|income/i.test(text);
  const isDebit =
    /debited|paid|payment|deducted|charged|spent|purchase|withdraw/i.test(text);

  if (!isCredit && !isDebit) return null;

  const type = isCredit ? "income" : "expense";

  // Category mapping
  const category = detectCategory(text);

  // Merchant detection
  const merchant = detectMerchant(sms);

  return {
    isFinancial: true,
    type,
    amount,
    category,
    merchant,
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
  const merchantPatterns = [
    /(?:at|to|from|via)\s+([A-Z][a-zA-Z\s]{2,20})/,
    /(?:merchant:|purchase at)\s*([A-Za-z\s]{2,25})/i,
  ];
  for (const p of merchantPatterns) {
    const m = sms.match(p);
    if (m) return m[1].trim();
  }
  return null;
}
