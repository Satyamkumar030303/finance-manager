const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const bcrypt = require("bcryptjs");

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.updateProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error("Current password is incorrect");
    err.statusCode = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
};

exports.getAccountSummary = async (userId) => {
  const mongoose = require("mongoose");
  const oid = new mongoose.Types.ObjectId(userId);

  const [txnStats] = await Transaction.aggregate([
    { $match: { user: oid } },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
        totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
      },
    },
  ]);

  return txnStats || { totalTransactions: 0, totalIncome: 0, totalExpense: 0 };
};
