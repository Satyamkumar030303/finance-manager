const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

// Static rates relative to INR — updated manually or via cron from exchange rate API
const RATES_FROM_INR = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.77,
  AED: 0.044,
  SAR: 0.045,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
};

// GET /api/currency/rates — returns current rates
router.get("/rates", authMiddleware, (req, res) => {
  res.json({ success: true, base: "INR", rates: RATES_FROM_INR, updatedAt: new Date().toISOString() });
});

// POST /api/currency/convert — { amount, from, to }
router.post("/convert", authMiddleware, (req, res) => {
  const { amount, from = "INR", to = "INR" } = req.body;
  if (!amount || isNaN(amount)) return res.status(400).json({ message: "Invalid amount" });

  const rateFrom = RATES_FROM_INR[from];
  const rateTo = RATES_FROM_INR[to];
  if (!rateFrom || !rateTo) return res.status(400).json({ message: "Unsupported currency" });

  const inINR = parseFloat(amount) / rateFrom;
  const converted = inINR * rateTo;

  res.json({ success: true, data: { amount: parseFloat(amount), from, to, converted: Math.round(converted * 100) / 100 } });
});

module.exports = router;
