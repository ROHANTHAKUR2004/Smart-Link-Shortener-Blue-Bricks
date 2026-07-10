import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import RefreshToken from "../models/refreshToken.model.js";
import ApiError from "../utils/apiError.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, type: "access" }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, type: "refresh" }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });


export const issueRefreshToken = async (user) => {
  const token = signRefreshToken(user);

  await RefreshToken.create({
    tokenHash: hashToken(token),
    user: user.id,
    expiresAt: new Date(Date.now() + config.jwt.refreshExpiresMs),
  });

  return token;
};

export const issueTokenPair = async (user) => ({
  accessToken: signAccessToken(user),
  refreshToken: await issueRefreshToken(user),
});

export const consumeRefreshToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  const stored = await RefreshToken.findOneAndDelete({
    tokenHash: hashToken(token),
  });

  if (!stored) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  return payload.sub;
};

export const revokeRefreshToken = (token) =>
  RefreshToken.deleteOne({ tokenHash: hashToken(token) });

export const verifyAccessToken = (token) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  if (payload.type !== "access") {
    throw new ApiError(401, "Invalid or expired access token");
  }

  return payload.sub;
};
