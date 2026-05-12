const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    limitAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    month:{
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true,
    },
    alertThreshold: {
        type: Number,
        default: 80,
        min: 1,
        max: 100,
    },
},
    { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1, year: 1 });

module.exports = mongoose.model("Budget", budgetSchema);