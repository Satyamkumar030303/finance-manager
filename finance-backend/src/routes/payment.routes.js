const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const paymentController = require("../controllers/payment.controller");

// Stripe webhook — raw body needed for signature verification
// In production, mount this BEFORE express.json() in app.js or use body-parser on this route only
router.post("/webhook", paymentController.webhook);

router.use(authMiddleware);
router.post("/create-checkout", paymentController.createCheckout);
router.get("/status", paymentController.getStatus);

module.exports = router;
