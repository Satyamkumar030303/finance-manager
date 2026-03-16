const Budget = require("../models/budget.model");
const budgetService = require("../services/budget.service");

exports.createBudget = async (req, res, next) => {
    try{
        const {category, limitAmount, month, year} = req.body;

        const budget = await Budget.create({
            user: req.user.id,
            category: category.toLowerCase(),
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

exports.getBudgetComparison = async ( req, res, next) => {
    try {
        const {month, year} = req.query;

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
}
