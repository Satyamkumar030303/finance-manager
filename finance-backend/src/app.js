const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("./middlewares/sanitize.middleware");
const cookieParser = require("cookie-parser");

const morganMiddleware = require("./middlewares/morganMiddleware");
const errorHandler = require("./middlewares/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const userRoutes = require("./routes/user.routes");
const goalRoutes = require("./routes/goal.routes");
const recurringRoutes = require("./routes/recurring.routes");
const aiRoutes = require("./routes/ai.routes");
const paymentRoutes = require("./routes/payment.routes");
const currencyRoutes = require("./routes/currency.routes");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));


//  Rate Limiting (before routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);


// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Sanitize MongoDB queries (NoSQL injection prevention)
app.use(mongoSanitize());

// Logging
app.use(morganMiddleware);


//  Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "finance-manager-api",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Finance Manager API" });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/currency", currencyRoutes);


//  404 Handler (Route Not Found)
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});


//  Global Error Handler (Always Last)
app.use(errorHandler);


module.exports = app;