const authService = require("../services/auth.service");

const COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  path: "/",
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  monthlyIncome: user.monthlyIncome,
  tier: user.tier,
  preferredCurrency: user.preferredCurrency,
  preferredLanguage: user.preferredLanguage,
  avatarUrl: user.avatarUrl,
});

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: safeUser(user),
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const device = req.headers["user-agent"] || "unknown";
    const { user, accessToken, rawRefreshToken } = await authService.loginUser(req.body, device);

    res.cookie(COOKIE_NAME, rawRefreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      user: safeUser(user),
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies[COOKIE_NAME];
    const { user, accessToken, rawRefreshToken: newRefresh } = await authService.refreshAccessToken(rawRefreshToken);

    res.cookie(COOKIE_NAME, newRefresh, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      accessToken,
      user: safeUser(user),
    });
  } catch (error) {
    res.clearCookie(COOKIE_NAME);
    res.status(error.statusCode || 401).json({ success: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies[COOKIE_NAME];
    await authService.logoutUser(rawRefreshToken);
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ success: true, message: "Logged out" });
  }
};
