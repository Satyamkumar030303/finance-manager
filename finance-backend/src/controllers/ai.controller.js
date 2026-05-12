const mlService = require("../services/ml.service");
const financialScore = require("../utils/financialScore");

exports.chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const reply = await mlService.chat(req.user.id, message, history);
    res.status(200).json({ success: true, data: { reply, role: "assistant" } });
  } catch (error) {
    if (error.message?.includes("API_KEY")) {
      return res.status(503).json({ success: false, message: "AI service not configured" });
    }
    next(error);
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
    if (error.message?.includes("API_KEY")) {
      return res.status(503).json({ success: false, message: "AI service not configured" });
    }
    next(error);
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
    const analysis = await mlService.analyzeSpending(req.user.id);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    if (error.message?.includes("API_KEY")) {
      return res.status(503).json({ success: false, message: "AI service not configured" });
    }
    next(error);
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
    next(error);
  }
};
