const Joi = require("joi");

exports.updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  monthlyIncome: Joi.number().min(0).optional(),
  preferredCurrency: Joi.string().length(3).uppercase().optional(),
  preferredLanguage: Joi.string().min(2).max(5).optional(),
  avatarUrl: Joi.string().uri().allow(null, "").optional(),
});

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});
