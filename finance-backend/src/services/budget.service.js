const Budget = require("../models/budget.model");
const Transaction = require("../models/transaction.model");
const mongoose = require("mongoose");

exports.getBudgetComparison = async (userId, month, year) => {
    const budgets = await Budget.find({
         user: userId, 
         month, 
         year 
        });

        const stratDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const expances = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    type: "expense",
                    transactionDate: {
                        $gte: stratDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalSpent: { $sum: "$amount" },
                }
            }
        ]);

        const expencesMap = {};
        expances.forEach(e => {
            // Normalize to PascalCase for consistent lookup
            const key = e._id
                ? e._id.trim().charAt(0).toUpperCase() + e._id.trim().slice(1).toLowerCase()
                : "Miscellaneous";
            expencesMap[key] = e.totalSpent;
        });

        const result = budgets.map(budget => {
            const spent = expencesMap[budget.category] || 0;
            const percentage = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;

            return {
                _id: budget._id,
                category: budget.category,
                budget: budget.limitAmount,
                actual: spent,
                percentage,
                alertThreshold: budget.alertThreshold || 80,
                month: budget.month,
                year: budget.year,
                status: spent > budget.limitAmount ? "Exceeded" : percentage >= (budget.alertThreshold || 80) ? "Warning" : "Within Budget",
            };
        });
        return result;
        };

