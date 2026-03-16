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
    
    date: Joi.date().optional()
});