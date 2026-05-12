const RecurringTransaction = require("../models/recurringTransaction.model");
const Transaction = require("../models/transaction.model");

const nextRunDate = (frequency, fromDate = new Date()) => {
  const d = new Date(fromDate);
  switch (frequency) {
    case "daily":   d.setDate(d.getDate() + 1); break;
    case "weekly":  d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "yearly":  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
};

exports.createRecurring = async (userId, data) => {
  const category = data.category.trim().charAt(0).toUpperCase() + data.category.trim().slice(1).toLowerCase();

  // Default first run = today if not provided
  const firstRun = data.startDate ? new Date(data.startDate) : new Date();
  return RecurringTransaction.create({
    user: userId,
    ...data,
    category,
    nextRunDate: firstRun,
  });
};

exports.getRecurring = async (userId) => {
  return RecurringTransaction.find({ user: userId }).sort({ nextRunDate: 1 });
};

exports.updateRecurring = async (userId, id, updates) => {
  const rec = await RecurringTransaction.findOne({ _id: id, user: userId });
  if (!rec) {
    const err = new Error("Recurring transaction not found");
    err.statusCode = 404;
    throw err;
  }
  Object.assign(rec, updates);
  await rec.save();
  return rec;
};

exports.deleteRecurring = async (userId, id) => {
  const rec = await RecurringTransaction.findOneAndDelete({ _id: id, user: userId });
  if (!rec) {
    const err = new Error("Recurring transaction not found");
    err.statusCode = 404;
    throw err;
  }
  return rec;
};

/**
 * Called by background job — processes all due recurring transactions.
 * Returns number of transactions created.
 */
exports.processDue = async () => {
  const now = new Date();
  const due = await RecurringTransaction.find({ isActive: true, nextRunDate: { $lte: now } });

  let count = 0;
  for (const rec of due) {
    await Transaction.create({
      user: rec.user,
      type: rec.type,
      category: rec.category,
      amount: rec.amount,
      description: rec.description || `Recurring: ${rec.category}`,
      transactionDate: rec.nextRunDate,
      source: "recurring",
      recurringId: rec._id,
    });

    rec.lastRunDate = rec.nextRunDate;
    rec.nextRunDate = nextRunDate(rec.frequency, rec.nextRunDate);
    await rec.save();
    count++;
  }

  return count;
};
