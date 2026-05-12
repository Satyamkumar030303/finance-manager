const Budget = require("../models/budget.model");
const budgetService = require("../services/budget.service");

exports.createBudget = async (req, res, next) => {
    try{
        const {category, limitAmount, month, year} = req.body;

        const normalizedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();

        // Prevent duplicate budget for same category+month+year
        const existing = await Budget.findOne({
            user: req.user.id,
            category: normalizedCategory,
            month,
            year,
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Budget for "${normalizedCategory}" in ${month}/${year} already exists`,
            });
        }

        const budget = await Budget.create({
            user: req.user.id,
            category: normalizedCategory,
            limitAmount,
            month,
            year
        });

        res.status(201).json({
            success: true,
            message: "Budget created successfully..",
            data: budget
        });
    } catch (error) {
        next(error);
    }
};

exports.getBudgets = async (req, res, next) => {
    try {
        const{month, year} = req.query;

        const budgets = await Budget.find({
            user: req.user.id, 
            month: parseInt(month), 
            year: parseInt(year)
        });

        res.status(200).json({
            success: true,
            data: budgets
        });
    } catch (error) {
        next(error);
    }
};

exports.getBudgetComparison = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        const data = await budgetService.getBudgetComparison(
            req.user.id,
            parseInt(month),
            parseInt(year),
        );

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBudget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { limitAmount, alertThreshold } = req.body;

        const budget = await Budget.findOne({ _id: id, user: req.user.id });
        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        if (limitAmount !== undefined) budget.limitAmount = limitAmount;
        if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
        await budget.save();

        res.status(200).json({ success: true, message: "Budget updated", data: budget });
    } catch (error) {
        next(error);
    }
};

exports.deleteBudget = async (req, res, next) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findOneAndDelete({ _id: id, user: req.user.id });
        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        res.status(200).json({ success: true, message: "Budget deleted" });
    } catch (error) {
        next(error);
    }
};
