const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const tierGate = require("../middlewares/tierGate.middleware");
const rateLimit = require("express-rate-limit");

// Tighter rate limit for AI endpoints (cost management) — keyed by userId after auth
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: "AI request limit reached. Please try again in an hour.",
});

// Financial score — available to all tiers
router.get("/score", authMiddleware, aiController.getScore);

// Subscription detection — available to all tiers
router.get("/subscriptions", authMiddleware, aiController.detectSubscriptions);

// Spending prediction — available to all tiers (algorithmic, no LLM)
router.get("/predict", authMiddleware, aiController.predict);

// Premium AI features
router.post("/chat", authMiddleware, aiLimiter, aiController.chat);
router.get("/recommendations", authMiddleware, aiLimiter, aiController.getRecommendations);
router.get("/analyze", authMiddleware, aiLimiter, aiController.analyzeSpending);

// SMS parser — used by Android app
router.post("/parse-sms", authMiddleware, aiController.parseSMS);

module.exports = router;
