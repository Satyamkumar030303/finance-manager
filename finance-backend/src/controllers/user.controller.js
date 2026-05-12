const userService = require("../services/user.service");
const financialScore = require("../utils/financialScore");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "monthlyIncome", "preferredCurrency", "preferredLanguage", "avatarUrl"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await userService.updateProfile(req.user.id, updates);
    res.status(200).json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getFinancialScore = async (req, res, next) => {
  try {
    const score = await financialScore.calculate(req.user.id);
    res.status(200).json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
};
