const User = require("../models/user.model.js");
const RefreshToken = require("../models/refreshToken.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

exports.registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Email is already registered");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({ name, email, password: hashedPassword });
  return user;
};

exports.loginUser = async ({ email, password }, device = "unknown") => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const rawRefreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: user._id,
    tokenHash: RefreshToken.hash(rawRefreshToken),
    device,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return { user, accessToken, rawRefreshToken };
};

exports.refreshAccessToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    const err = new Error("No refresh token provided");
    err.statusCode = 401;
    throw err;
  }

  const tokenHash = RefreshToken.hash(rawRefreshToken);
  const stored = await RefreshToken.findOne({ tokenHash }).populate("user");

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await stored.deleteOne();
    const err = new Error("Refresh token expired or invalid");
    err.statusCode = 401;
    throw err;
  }

  // Rotate: delete old, create new
  const newRawToken = generateRefreshToken();
  await stored.deleteOne();
  await RefreshToken.create({
    user: stored.user._id,
    tokenHash: RefreshToken.hash(newRawToken),
    device: stored.device,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  const accessToken = generateAccessToken(stored.user._id);
  return { user: stored.user, accessToken, rawRefreshToken: newRawToken };
};

exports.logoutUser = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = RefreshToken.hash(rawRefreshToken);
  await RefreshToken.deleteOne({ tokenHash });
};
