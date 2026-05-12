const mlService = require("../services/ml.service");
const financialScore = require("../utils/financialScore");
const logger = require("../config/logger");

const AI_UNAVAILABLE = "AI assistant temporarily unavailable. Please try again later.";

// ─── Phase 1 ──────────────────────────────────────────────────────────────────

exports.chat = async (req, res, next) => {
  try {
    const { message, history = [], language } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    const lang = language || req.user?.preferredLanguage || "en";
    const reply = await mlService.chat(req.user.id, message, history, lang);
    res.status(200).json({ success: true, data: { reply, role: "assistant" } });
  } catch (error) {
    logger.error("[AI] chat controller error", { error: error.message });
    res.status(200).json({
      success: false,
      message: AI_UNAVAILABLE,
      data: { reply: AI_UNAVAILABLE, role: "assistant" },
    });
  }
};

exports.getScore = async (req, res, next) => {
  try {
    const score = await financialScore.calculate(req.user.id);
    res.status(200).json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await mlService.getRecommendations(req.user.id);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    logger.error("[AI] getRecommendations controller error", { error: error.message });
    res.status(200).json({ success: false, message: AI_UNAVAILABLE, data: [] });
  }
};

exports.predict = async (req, res, next) => {
  try {
    const prediction = await mlService.predictNextMonth(req.user.id);
    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
};

exports.analyzeSpending = async (req, res, next) => {
  try {
    const { language } = req.body;
    const lang = language || req.user?.preferredLanguage || "en";
    const analysis = await mlService.analyzeSpending(req.user.id, lang);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    logger.error("[AI] analyzeSpending controller error", { error: error.message });
    res.status(200).json({
      success: false,
      message: AI_UNAVAILABLE,
      data: { unavailable: true },
    });
  }
};

exports.detectSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await mlService.detectSubscriptions(req.user.id);
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

exports.parseSMS = async (req, res, next) => {
  try {
    const { smsText, sender } = req.body;
    if (!smsText) {
      return res.status(400).json({ success: false, message: "smsText is required" });
    }
    const result = await mlService.parseSMS(smsText, sender);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error("[AI] parseSMS controller error", { error: error.message });
    res.status(200).json({ success: true, data: { isFinancial: false } });
  }
};

exports.testAI = async (req, res, next) => {
  try {
    const result = await mlService.testConnection();
    res.status(200).json({
      success: true,
      message: "OpenRouter connection successful",
      data: {
        raw: result,
        models: {
          finance: process.env.DEEPSEEK_MODEL || "deepseek/deepseek-chat",
          chat: process.env.QWEN_MODEL || "qwen/qwen-2.5-7b-instruct",
        },
      },
    });
  } catch (error) {
    logger.error("[AI] testAI failed", { error: error.message });
    res.status(503).json({ success: false, message: AI_UNAVAILABLE, error: error.message });
  }
};

// ─── Phase 2 ──────────────────────────────────────────────────────────────────

exports.getBudgetAdvice = async (req, res, next) => {
  try {
    const advice = await mlService.getBudgetAdvice(req.user.id);
    res.status(200).json({ success: true, data: advice });
  } catch (error) {
    logger.error("[AI] getBudgetAdvice error", { error: error.message });
    res.status(200).json({ success: false, message: AI_UNAVAILABLE, data: null });
  }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const report = await mlService.getMonthlyReport(req.user.id);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    logger.error("[AI] getMonthlyReport error", { error: error.message });
    res.status(200).json({ success: false, message: AI_UNAVAILABLE, data: null });
  }
};

exports.getFinancialInsights = async (req, res, next) => {
  try {
    const insights = await mlService.getFinancialInsights(req.user.id);
    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    logger.error("[AI] getFinancialInsights error", { error: error.message });
    res.status(200).json({ success: false, message: AI_UNAVAILABLE, data: null });
  }
};
