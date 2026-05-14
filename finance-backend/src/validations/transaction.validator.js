const Joi = require("joi");

exports.createTransactionSchema = Joi.object({
    type: Joi.string()
    .valid("income", "expense")
    .required(),

    category: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

    amount: Joi.number()
    .positive()
    .required(),

    description: Joi.string()
    .allow("")
    .optional(),

    transactionDate: Joi.date()
    .optional(),

    date: Joi.date().optional(),

    // Fields the Mongoose model + controller already handle but were missing here.
    source: Joi.string().valid("manual", "sms", "recurring").optional(),
    merchant: Joi.string().trim().max(100).allow("", null).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    currency: Joi.string().length(3).uppercase().optional(),
});