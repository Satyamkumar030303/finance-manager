const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    icon: {
      type: String,
      default: "🎯",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, isCompleted: 1 });

module.exports = mongoose.model("Goal", goalSchema);
