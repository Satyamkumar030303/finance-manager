const express = require("express");
const router = express.Router();

const budgetController = require("../controllers/budget.controller");
const authMiddleware = require("../middlewares/auth.middleware");


router.post("/", authMiddleware, budgetController.createBudget);
router.get("/", authMiddleware, budgetController.getBudgets);
router.get("/comparison", authMiddleware, budgetController.getBudgetComparison);
router.put("/:id", authMiddleware, budgetController.updateBudget);
router.delete("/:id", authMiddleware, budgetController.deleteBudget);

module.exports = router;