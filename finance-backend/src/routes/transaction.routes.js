const express = require("express");
const  validate  = require("../middlewares/validate.middleware");
const { createTransactionSchema } = require("../validations/transaction.validator");


const {
  createTransaction,
  getUserTransactions,
  getMonthlySummary,
  getCategorySummary,
  getMonthlyTrends,
  deleteTransaction,
  updateTransaction,
  getRecentTransactions
} = require("../controllers/transaction.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// protected routes
router.get(
    "/summary",
    authMiddleware,
    getMonthlySummary
);

router.get(
    "/category-summary",
    authMiddleware,
    getCategorySummary
);

router.get(
    "/trends",
    authMiddleware,
    getMonthlyTrends
);

router.get(
    "/recent",
    authMiddleware,
    getRecentTransactions
);

router.post(
    "/",
    authMiddleware, 
    validate(createTransactionSchema), 
    createTransaction
);

router.get(
    "/", 
    authMiddleware, 
    getUserTransactions
);
router.delete(
    "/:id", 
    authMiddleware, 
    deleteTransaction
);
router.put(
    "/:id", 
    authMiddleware, 
    updateTransaction
);

module.exports = router;