const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const morganMiddleware = require("./middlewares/morganMiddleware");
const errorHandler = require("./middlewares/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");

const app = express();


//  Security Middlewares
app.use(helmet());
app.use(cors());


//  Rate Limiting (before routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);


// Body Parser
app.use(express.json());


// Logging
app.use(morganMiddleware);


//  Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Finance Manager API is running successfully",
  });
});


//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);


//  404 Handler (Route Not Found)
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});


//  Global Error Handler (Always Last)
app.use(errorHandler);


module.exports = app;