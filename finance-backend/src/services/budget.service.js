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
            expencesMap[e._id] = e.totalSpent;
        });

        const result = budgets.map(budget =>{
            const spent = expencesMap[budget.category] || 0;

            return {
                category: budget.category,
                budget: budget.limitAmount,
                actual: spent,
                status: spent > budget.limitAmount ? "Exceeded" : "Within Budget"
            };
        });
        return result;
        };

