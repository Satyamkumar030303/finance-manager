const goalService = require("../services/goal.service");

exports.createGoal = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Goal created", data: goal });
  } catch (error) {
    next(error);
  }
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getGoals(req.user.id);
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Goal updated", data: goal });
  } catch (error) {
    next(error);
  }
};

exports.addContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be positive" });
    }
    const goal = await goalService.addContribution(req.user.id, req.params.id, amount);
    res.status(200).json({ success: true, message: "Contribution added", data: goal });
  } catch (error) {
    next(error);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    await goalService.deleteGoal(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Goal deleted" });
  } catch (error) {
    next(error);
  }
};
