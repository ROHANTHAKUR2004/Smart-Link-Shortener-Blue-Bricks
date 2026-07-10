import config, { isProduction } from "../config/index.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  consumeRefreshToken,
  issueTokenPair,
  revokeRefreshToken,
  signAccessToken,
  issueRefreshToken,
} from "../services/token.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: config.cookie.path,
  maxAge: config.jwt.refreshExpiresMs,
};

const sendRefreshCookie = (res, token) =>
  res.cookie(config.cookie.name, token, cookieOptions);

const clearRefreshCookie = (res) =>
  res.clearCookie(config.cookie.name, {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: config.cookie.path,
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = await issueTokenPair(user);

  sendRefreshCookie(res, refreshToken);
  res.status(201).json({
    success: true,
    message: "Account created",
    data: { user, accessToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  sendRefreshCookie(res, refreshToken);
  res.json({
    success: true,
    message: "Logged in",
    data: { user, accessToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[config.cookie.name];

  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  const userId = await consumeRefreshToken(token);
  const user = await User.findById(userId);

  if (!user) {
    clearRefreshCookie(res);
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const accessToken = signAccessToken(user);
  sendRefreshCookie(res, await issueRefreshToken(user));

  res.json({
    success: true,
    message: "Token refreshed",
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[config.cookie.name];

  if (token) {
    await revokeRefreshToken(token);
  }
  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
