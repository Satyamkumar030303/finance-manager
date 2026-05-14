const Transaction = require("../models/transaction.model");
const mongoose = require("mongoose");

exports.createTransaction = async (userId, data) => {
    const { type, category, amount, description, date } = data;

    const transaction = await Transaction.create({
        user: userId,
        type,
        category,
        amount,
        description,
        date,
    });

    return transaction;
};

exports.getUserTransactions = async (userId, queryParams = {}) => {
    const { page = 1, limit = 20, type, category, month, year, startDate, endDate, search } = queryParams;

    const pageNumber = parseInt(page);
    const pageSize = Math.min(parseInt(limit), 100); // cap at 100
    const skip = (pageNumber - 1) * pageSize;

    const filters = { user: userId };

    if (type) filters.type = type;

    if (category) {
        // Match PascalCase-normalized category
        const normalized = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
        filters.category = normalized;
    }

    // Date range: prefer month+year (UI), fall back to startDate/endDate (export/back-compat)
    if (month && year) {
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        if (!Number.isNaN(m) && !Number.isNaN(y)) {
            filters.transactionDate = {
                $gte: new Date(y, m - 1, 1),
                $lt:  new Date(y, m,     1),
            };
        }
    } else if (startDate || endDate) {
        filters.transactionDate = {};
        if (startDate) filters.transactionDate.$gte = new Date(startDate);
        if (endDate) filters.transactionDate.$lte = new Date(endDate);
    }

    if (search) {
        filters.$or = [
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { merchant: { $regex: search, $options: "i" } },
        ];
    }

    const [totalRecords, transactions] = await Promise.all([
        Transaction.countDocuments(filters),
        Transaction.find(filters)
            .sort({ transactionDate: -1 })
            .skip(skip)
            .limit(pageSize),
    ]);

    return {
        transactions,
        pagination: {
            totalRecords,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalRecords / pageSize),
            pageSize,
        },
    };
};

exports.getMonthlySummary = async (userId, month, year) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await Transaction.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                transactionDate: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group: {
                _id: "$type",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;

    result.forEach(item => {
        if (item._id === "income") totalIncome = item.totalAmount;
        if (item._id === "expense") totalExpense = item.totalAmount;
        transactionCount += item.count;
    });

    return {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        transactionCount
    };
};

exports.getCategorySummary = async(userId, month, year, type) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const matchStage = {
        user: new mongoose.Types.ObjectId(userId),
        transactionDate: {
            $gte: startDate,
            $lt: endDate
        }
    };

    if (type) {
        matchStage.type = type;
    }

    const result = await Transaction.aggregate([
        {
            $match: matchStage
        },
        {
            $group: {
                _id: "$category",
                totalAmount: { $sum: "$amount" },
            }
        },
        {
            $project: {
                _id: 0,
                category: "$_id",
                total: 1
            }
        },
        {
            $sort: {
                total: -1
            }
            }
    ]);
    return result;
};

exports.getMonthlyTrends = async (userId, months = 6) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await Transaction.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                transactionDate: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$transactionDate" },
                    year: { $year: "$transactionDate" },
                    type: "$type"
                },
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        {
            $group:{
                _id: {
                    year: "$_id.year",
                    month: "$_id.month"
                },
                income:{
                    $sum:{
                        $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0]
                        }
                    },
                    expense:{
                        $sum:{
                            $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0]
                    }
                }
            }
        },

        {
            $sort: {
                "_id.year": -1,
                "_id.month": 1
            }
        }
    ]);

    const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

    return result.map(item => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        income: item.income,
        expense: item.expense
    }))
};   