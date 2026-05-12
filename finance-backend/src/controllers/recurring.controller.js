const recurringService = require("../services/recurring.service");

exports.createRecurring = async (req, res, next) => {
  try {
    const rec = await recurringService.createRecurring(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Recurring transaction created", data: rec });
  } catch (error) {
    next(error);
  }
};

exports.getRecurring = async (req, res, next) => {
  try {
    const data = await recurringService.getRecurring(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateRecurring = async (req, res, next) => {
  try {
    const rec = await recurringService.updateRecurring(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Updated", data: rec });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecurring = async (req, res, next) => {
  try {
    await recurringService.deleteRecurring(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Recurring transaction deleted" });
  } catch (error) {
    next(error);
  }
};
