const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password:{
    type: String,
    required: true,
    minlenght: 6
  },
  monthlyIncome:{
    type: Number,
    default: 0,
  },
  tier: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  preferredCurrency: {
    type: String,
    default: "INR",
  },
  preferredLanguage: {
    type: String,
    default: "en",
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
},
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
