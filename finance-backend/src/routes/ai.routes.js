const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const rateLimit = require("express-rate-limit");

// Tighter rate limit for AI endpoints (cost management)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: "AI request limit reached. Please try again in an hour.",
});

// ─── No LLM cost — all tiers ──────────────────────────────────────────────────
router.get("/score",         authMiddleware, aiController.getScore);
router.get("/subscriptions", authMiddleware, aiController.detectSubscriptions);
router.get("/predict",       authMiddleware, aiController.predict);

// ─── LLM routes — rate limited ───────────────────────────────────────────────
router.post("/chat",         authMiddleware, aiLimiter, aiController.chat);
router.get("/recommendations", authMiddleware, aiLimiter, aiController.getRecommendations);
router.post("/analyze",      authMiddleware, aiLimiter, aiController.analyzeSpending);
router.post("/parse-sms",    authMiddleware,             aiController.parseSMS);

// ─── Phase 2 routes ───────────────────────────────────────────────────────────
router.get("/budget-advice",  authMiddleware, aiLimiter, aiController.getBudgetAdvice);
router.get("/monthly-report", authMiddleware, aiLimiter, aiController.getMonthlyReport);
router.get("/insights",       authMiddleware, aiLimiter, aiController.getFinancialInsights);

// ─── Connection test — protected ─────────────────────────────────────────────
router.post("/test", authMiddleware, aiLimiter, aiController.testAI);

module.exports = router;
