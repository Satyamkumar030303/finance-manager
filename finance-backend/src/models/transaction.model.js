const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["manual", "sms", "recurring"],
      default: "manual",
    },
    merchant: {
      type: String,
      trim: true,
      default: null,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringTransaction",
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    currency: {
      type: String,
      default: "INR",
    },
    originalAmount: {
      type: Number,
      default: null,
    },
    originalCurrency: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, source: 1 });
transactionSchema.index({ description: "text", category: "text" });

module.exports = mongoose.model("Transaction", transactionSchema);
