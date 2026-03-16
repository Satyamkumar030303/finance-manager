const transactionService = require("../services/transaction.service");
const Transaction = require("../models/transaction.model");
const mongoose = require("mongoose");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {

    const { amount, type, category, transactionDate, description } = req.body;

    // Normalize category
    const formattedCategory =
      category.charAt(0).toUpperCase() +
      category.slice(1).toLowerCase();

    const transaction = new Transaction({
      user: req.user.id,
      amount,
      type,
      category: formattedCategory,
      transactionDate,
      description
    });

    await transaction.save();

    res.status(201).json(transaction);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER TRANSACTIONS
exports.getUserTransactions = async (req, res, next) => {
  try {
    const data = await transactionService.getUserTransactions(
      req.user.id,
      req.query
    );

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



// DASHBOARD SUMMARY
exports.getMonthlySummary = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const userId = req.user.id;
    const { period } = req.query;

    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    if (period === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    let matchStage = {
      user: new mongoose.Types.ObjectId(userId)
    };

    if (period !== "all" && startDate && endDate) {
      matchStage.transactionDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    res.json({
      success: true,
      data: {
        totalIncome: income,
        totalExpense: expense,
        netSavings: income - expense,
      },
    });
//      console.log("Aggregation result:", result);
//   console.log("USER ID:", req.user.id);
//   console.log("MATCH STAGE:", matchStage);
//   console.log("AGG RESULT:", result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
 
};


// CATEGORY SUMMARY
exports.getCategorySummary = async (req, res) => {
  try {

    const userId = req.user.id;
    const { period } = req.query;

    let match = {
      user: new mongoose.Types.ObjectId(userId)
    };

    if (period === "month") {
      const start = new Date();
      start.setDate(1);
      match.transactionDate = { $gte: start };
    }

    if (period === "year") {
      const start = new Date(new Date().getFullYear(), 0, 1);
      match.transactionDate = { $gte: start };
    }

    const summary = await Transaction.aggregate([
      { $match: match },
      { $match: { type: "expense" } },

      {
        $group: {
          _id: { $toLower: "$category" }, // normalize
          total: { $sum: "$amount" }
        }
      },

      {
        $project: {
          _id: 0,
          category: {
            $concat: [
              { $toUpper: { $substrCP: ["$_id", 0, 1] } },
              { $substrCP: ["$_id", 1, { $strLenCP: "$_id" }] }
            ]
          },
          amount: "$total"
        }
      }

    ]);

    res.json(summary);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MONTHLY TRENDS
// MONTHLY / DAILY / YEARLY TRENDS
// MONTHLY / DAILY / YEARLY TRENDS
exports.getMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query;

    const now = new Date();

    let startDate;
    let endDate;
    let groupBy;

    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      groupBy = { $dayOfMonth: "$transactionDate" };
    }

    else if (period === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      groupBy = { $dayOfMonth: "$transactionDate" };
    }

    else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      groupBy = { $month: "$transactionDate" };
    }

    else if (period === "decade") {
      startDate = new Date(now.getFullYear() - 10, 0, 1);
      endDate = now;
      groupBy = { $year: "$transactionDate" };
    }

    else if (period === "all") {
      groupBy = { $year: "$transactionDate" };
    }

    let matchStage = {
      user: new mongoose.Types.ObjectId(userId),
      type: "expense"
    };

    if (period !== "all") {
      matchStage.transactionDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const trends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends);

  } catch (error) {
    console.error("Trend error:", error);
    res.status(500).json({ message: error.message });
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
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};