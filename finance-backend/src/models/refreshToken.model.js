const mongoose = require("mongoose");
const crypto = require("crypto");

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    default: "unknown",
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index — MongoDB auto-deletes expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });

refreshTokenSchema.statics.hash = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
