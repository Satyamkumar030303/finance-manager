const Goal = require("../models/goal.model");

exports.createGoal = async (userId, data) => {
  return Goal.create({ user: userId, ...data });
};

exports.getGoals = async (userId) => {
  return Goal.find({ user: userId }).sort({ isCompleted: 1, createdAt: -1 });
};

exports.updateGoal = async (userId, goalId, updates) => {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) {
    const err = new Error("Goal not found");
    err.statusCode = 404;
    throw err;
  }

  Object.assign(goal, updates);

  // Auto-complete when target reached
  if (goal.savedAmount >= goal.targetAmount) {
    goal.isCompleted = true;
  }

  await goal.save();
  return goal;
};

exports.addContribution = async (userId, goalId, amount) => {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) {
    const err = new Error("Goal not found");
    err.statusCode = 404;
    throw err;
  }

  goal.savedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
  if (goal.savedAmount >= goal.targetAmount) goal.isCompleted = true;
  await goal.save();
  return goal;
};

exports.deleteGoal = async (userId, goalId) => {
  const goal = await Goal.findOneAndDelete({ _id: goalId, user: userId });
  if (!goal) {
    const err = new Error("Goal not found");
    err.statusCode = 404;
    throw err;
  }
  return goal;
};
