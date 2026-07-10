import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../services/token.service.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const userId = verifyAccessToken(header.slice(7));

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  req.user = user;
  next();
});

export default protect;
