const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const mongoose = require("mongoose");

/**
 * Calculate a 0–100 financial health score for a user.
 * Score breakdown:
 *   Savings Rate      25 pts
 *   Budget Adherence  25 pts
 *   Expense Stability 20 pts
 *   Debt/EMI Ratio    15 pts
 *   Emergency Fund    15 pts
 */
exports.calculate = async (userId) => {
  const oid = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  // Last 3 months of data
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const transactions = await Transaction.find({
    user: oid,
    transactionDate: { $gte: threeMonthsAgo },
  });

  // ── 1. Savings Rate (25 pts) ──────────────────────────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  let savingsScore = 0;
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
    if (savingsRate >= 30) savingsScore = 25;
    else if (savingsRate >= 20) savingsScore = 20;
    else if (savingsRate >= 10) savingsScore = 14;
    else if (savingsRate >= 0) savingsScore = 7;
    else savingsScore = 0;
  }

  // ── 2. Budget Adherence (25 pts) ─────────────────────────────────────────
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const budgets = await Budget.find({ user: oid, month: currentMonth, year: currentYear });

  let budgetScore = 0;
  if (budgets.length > 0) {
    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 1);

    const categorySpend = {};
    transactions
      .filter((t) => t.type === "expense" && t.transactionDate >= monthStart && t.transactionDate < monthEnd)
      .forEach((t) => {
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
      });

    let withinBudget = 0;
    budgets.forEach((b) => {
      const spent = categorySpend[b.category] || 0;
      if (spent <= b.limitAmount) withinBudget++;
    });

    budgetScore = Math.round((withinBudget / budgets.length) * 25);
  } else {
    budgetScore = 12; // no budgets set = neutral
  }

  // ── 3. Expense Stability (20 pts) ────────────────────────────────────────
  const monthlyExpenses = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const key = `${t.transactionDate.getFullYear()}-${t.transactionDate.getMonth()}`;
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + t.amount;
    });

  let stabilityScore = 20;
  const monthValues = Object.values(monthlyExpenses);
  if (monthValues.length >= 2) {
    const avg = monthValues.reduce((s, v) => s + v, 0) / monthValues.length;
    const variance = monthValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / monthValues.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
    if (cv < 0.1) stabilityScore = 20;
    else if (cv < 0.25) stabilityScore = 15;
    else if (cv < 0.5) stabilityScore = 10;
    else stabilityScore = 5;
  }

  // ── 4. Debt/EMI Ratio (15 pts) ────────────────────────────────────────────
  const emiCategories = ["emi", "loan", "debt", "credit card"];
  const emiExpenses = transactions
    .filter((t) => t.type === "expense" && emiCategories.some((k) => t.category.toLowerCase().includes(k)))
    .reduce((s, t) => s + t.amount, 0);

  let debtScore = 15;
  if (totalIncome > 0) {
    const emiRatio = (emiExpenses / totalIncome) * 100;
    if (emiRatio === 0) debtScore = 15;
    else if (emiRatio < 20) debtScore = 12;
    else if (emiRatio < 40) debtScore = 7;
    else debtScore = 2;
  }

  // ── 5. Emergency Fund (15 pts) ───────────────────────────────────────────
  const monthlySavings = totalIncome > totalExpense ? (totalIncome - totalExpense) / 3 : 0;
  const avgMonthlyExpense =
    monthValues.length > 0 ? monthValues.reduce((s, v) => s + v, 0) / monthValues.length : 0;
  const targetEmergency = avgMonthlyExpense * 3;

  let emergencyScore = 0;
  if (monthlySavings > 0 && avgMonthlyExpense > 0) {
    const fundRatio = (monthlySavings * 3) / targetEmergency;
    if (fundRatio >= 1) emergencyScore = 15;
    else if (fundRatio >= 0.5) emergencyScore = 10;
    else if (fundRatio >= 0.25) emergencyScore = 5;
    else emergencyScore = 2;
  } else if (monthlySavings === 0 && avgMonthlyExpense > 0) {
    emergencyScore = 0;
  } else {
    emergencyScore = 7;
  }

  // ── Total ─────────────────────────────────────────────────────────────────
  const total = savingsScore + budgetScore + stabilityScore + debtScore + emergencyScore;
  const band = total >= 80 ? "Excellent" : total >= 60 ? "Good" : total >= 40 ? "Fair" : "Poor";
  const emoji = total >= 80 ? "🟢" : total >= 60 ? "🟡" : total >= 40 ? "🟠" : "🔴";

  return {
    score: total,
    band,
    emoji,
    breakdown: {
      savingsRate: { score: savingsScore, max: 25, label: "Savings Rate" },
      budgetAdherence: { score: budgetScore, max: 25, label: "Budget Adherence" },
      expenseStability: { score: stabilityScore, max: 20, label: "Expense Stability" },
      debtRatio: { score: debtScore, max: 15, label: "Debt/EMI Ratio" },
      emergencyFund: { score: emergencyScore, max: 15, label: "Emergency Fund" },
    },
    tips: generateTips({ savingsScore, budgetScore, stabilityScore, debtScore, emergencyScore }),
  };
};

function generateTips({ savingsScore, budgetScore, stabilityScore, debtScore, emergencyScore }) {
  const tips = [];
  if (savingsScore < 15) tips.push("Try to save at least 20% of your income each month.");
  if (budgetScore < 15) tips.push("Several budget categories are exceeded — review your spending limits.");
  if (stabilityScore < 10) tips.push("Your spending varies a lot month-to-month. Try to stabilize expenses.");
  if (debtScore < 10) tips.push("Your EMI/debt payments are high relative to income. Prioritize paying down high-interest debt.");
  if (emergencyScore < 10) tips.push("Build an emergency fund covering at least 3 months of expenses.");
  if (tips.length === 0) tips.push("Great work! Keep maintaining your healthy financial habits.");
  return tips;
}
