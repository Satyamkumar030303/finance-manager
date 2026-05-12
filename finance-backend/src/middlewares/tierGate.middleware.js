const User = require("../models/user.model");

/**
 * Middleware factory — blocks access if user's tier is below required tier.
 * @param {string} requiredTier - "premium"
 */
module.exports = (requiredTier = "premium") => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("tier");
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (requiredTier === "premium" && user.tier !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature requires a Premium subscription",
        upgradeRequired: true,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
