const transactionService = require("../services/transaction.service");
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const mongoose = require("mongoose");
const cache = require("../utils/cache");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, transactionDate, description, source, merchant, tags, currency } = req.body;

    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    const transaction = new Transaction({
      user: req.user.id,
      amount,
      type,
      category: formattedCategory,
      transactionDate,
      description,
      source: source || "manual",
      merchant: merchant || null,
      tags: tags || [],
      currency: currency || "INR",
    });

    await transaction.save();

    // Check budget alerts for expenses
    let budgetWarnings = [];
    if (type === "expense") {
      const now = new Date(transactionDate || Date.now());
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const budget = await Budget.findOne({ user: req.user.id, category: formattedCategory, month, year });

      if (budget) {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 1);
        const [agg] = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(req.user.id),
              type: "expense",
              category: formattedCategory,
              transactionDate: { $gte: monthStart, $lt: monthEnd },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalSpent = agg ? agg.total : 0;
        const pct = Math.round((totalSpent / budget.limitAmount) * 100);

        if (totalSpent > budget.limitAmount) {
          budgetWarnings.push({
            category: formattedCategory,
            message: `Budget exceeded! Spent ₹${totalSpent.toFixed(0)} of ₹${budget.limitAmount} limit`,
            percentage: pct,
            severity: "danger",
          });
        } else if (pct >= (budget.alertThreshold || 80)) {
          budgetWarnings.push({
            category: formattedCategory,
            message: `${pct}% of your ${formattedCategory} budget used`,
            percentage: pct,
            severity: "warning",
          });
        }
      }
    }

    // Invalidate dashboard cache for this user
    await cache.del(`dashboard:${req.user.id}:*`);

    res.status(201).json({ success: true, data: transaction, budgetWarnings });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER TRANSACTIONS (with search)
exports.getUserTransactions = async (req, res, next) => {
  try {
    const data = await transactionService.getUserTransactions(req.user.id, req.query);
    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: data.transactions,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};



// MONTHLY SUMMARY (Reports page)
exports.getMonthlySummary = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const userId = req.user.id;
    const m = parseInt(req.query.month, 10);
    const y = parseInt(req.query.year, 10);
    if (Number.isNaN(m) || Number.isNaN(y)) {
      return res.status(400).json({ success: false, message: "month and year are required" });
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate   = new Date(y, m,     1);

    const result = await Transaction.aggregate([
      { $match: {
          user: new mongoose.Types.ObjectId(userId),
          transactionDate: { $gte: startDate, $lt: endDate },
      }},
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of result) {
      if (row._id === "income")  totalIncome  = row.total;
      if (row._id === "expense") totalExpense = row.total;
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// CATEGORY SUMMARY (Reports page)
exports.getCategorySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const m = parseInt(req.query.month, 10);
    const y = parseInt(req.query.year, 10);
    if (Number.isNaN(m) || Number.isNaN(y)) {
      return res.status(400).json({ success: false, message: "month and year are required" });
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate   = new Date(y, m,     1);

    const data = await Transaction.aggregate([
      { $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: "expense",
          transactionDate: { $gte: startDate, $lt: endDate },
      }},
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MONTHLY TRENDS (Reports page — full year, bucketed per month)
exports.getMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const y = parseInt(req.query.year, 10);
    if (Number.isNaN(y)) {
      return res.status(400).json({ success: false, message: "year is required" });
    }

    const startDate = new Date(y, 0, 1);
    const endDate   = new Date(y + 1, 0, 1);

    const rows = await Transaction.aggregate([
      { $match: {
          user: new mongoose.Types.ObjectId(userId),
          transactionDate: { $gte: startDate, $lt: endDate },
      }},
      { $group: {
          _id: { month: { $month: "$transactionDate" }, type: "$type" },
          total: { $sum: "$amount" },
      }},
    ]);

    // Densify to all 12 months so the line chart has a continuous x-axis.
    const byMonth = new Map();
    for (let m = 1; m <= 12; m++) byMonth.set(m, { month: m, income: 0, expense: 0 });
    for (const r of rows) {
      const slot = byMonth.get(r._id.month);
      if (!slot) continue;
      if (r._id.type === "income")  slot.income  = r.total;
      if (r._id.type === "expense") slot.expense = r.total;
    }

    res.json({ success: true, data: Array.from(byMonth.values()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE TRANSACTION
exports.deleteTransaction = async (req, res) => {
  try {

    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await cache.del(`dashboard:${req.user.id}:*`);

    res.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE TRANSACTION
exports.updateTransaction = async (req, res) => {
  try {

    const { id } = req.params;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );

    await cache.del(`dashboard:${req.user.id}:*`);

    res.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction
      .find({ user: req.user.id })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORT TRANSACTIONS AS CSV
exports.exportTransactions = async (req, res) => {
  try {
    const { type, category, month, year, startDate, endDate, search } = req.query;
    const filters = { user: req.user.id };
    if (type) filters.type = type;
    if (category) filters.category = new RegExp(`^${category}$`, "i");

    // Prefer month+year (UI), fall back to explicit startDate/endDate.
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (!Number.isNaN(m) && !Number.isNaN(y)) {
        filters.transactionDate = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
      }
    } else if (startDate || endDate) {
      filters.transactionDate = {};
      if (startDate) filters.transactionDate.$gte = new Date(startDate);
      if (endDate) filters.transactionDate.$lte = new Date(endDate);
    }

    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: "i" } },
        { category:    { $regex: search, $options: "i" } },
        { merchant:    { $regex: search, $options: "i" } },
      ];
    }

    const transactions = await Transaction.find(filters).sort({ transactionDate: -1 }).limit(5000);

    const header = "Date,Type,Category,Amount,Description\n";
    const rows = transactions.map((t) => {
      const date = new Date(t.transactionDate).toLocaleDateString("en-IN");
      const desc = (t.description || "").replace(/,/g, " ");
      return `${date},${t.type},${t.category},${t.amount},${desc}`;
    });

    const csv = header + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CONSOLIDATED DASHBOARD (single round-trip, Redis cached)
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "month" } = req.query;
    const oid = new mongoose.Types.ObjectId(userId);

    const cacheKey = `dashboard:${userId}:${period}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }
    const now = new Date();

    let startDate, endDate;
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (period === "decade") {
      startDate = new Date(now.getFullYear() - 10, 0, 1);
      endDate = now;
    }

    const matchStage = { user: oid };
    if (startDate && endDate) matchStage.transactionDate = { $gte: startDate, $lte: endDate };

    const [dashboardData, recent] = await Promise.all([
      Transaction.aggregate([
        { $match: matchStage },
        {
          $facet: {
            summary: [
              { $group: { _id: "$type", total: { $sum: "$amount" } } },
            ],
            categoryBreakdown: [
              { $match: { type: "expense" } },
              { $group: { _id: { $toLower: "$category" }, total: { $sum: "$amount" } } },
              {
                $project: {
                  _id: 0,
                  category: {
                    $concat: [
                      { $toUpper: { $substrCP: ["$_id", 0, 1] } },
                      { $substrCP: ["$_id", 1, { $strLenCP: "$_id" }] },
                    ],
                  },
                  amount: "$total",
                },
              },
              { $sort: { amount: -1 } },
            ],
            trends: [
              {
                $group: {
                  _id: period === "month" || period === "lastMonth"
                    ? { $dayOfMonth: "$transactionDate" }
                    : period === "year"
                    ? { $month: "$transactionDate" }
                    : { $year: "$transactionDate" },
                  amount: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
                  income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      Transaction.find({ user: oid }).sort({ transactionDate: -1 }).limit(10),
    ]);

    const summary = dashboardData[0].summary;
    let income = 0, expense = 0;
    summary.forEach((s) => {
      if (s._id === "income") income = s.total;
      if (s._id === "expense") expense = s.total;
    });

    const result = {
      summary: { totalIncome: income, totalExpense: expense, netSavings: income - expense },
      categoryBreakdown: dashboardData[0].categoryBreakdown,
      trends: dashboardData[0].trends,
      recentTransactions: recent,
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};