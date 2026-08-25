const { verifyToken } = require("../utils/token");
const { User } = require("../models");
const { sendError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Verifies JWT, attaches req.user. Required on protected routes.
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return sendError(res, 401, "Authentication required", "NO_TOKEN");
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return sendError(res, 401, "Invalid or expired session", "INVALID_TOKEN");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return sendError(res, 401, "Account not found or inactive", "USER_NOT_FOUND");
  }

  req.user = user;
  next();
});

// Optional auth: attaches req.user if a valid token is present, but never blocks the request.
const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
});

// Role guard — use after `authenticate`.
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required", "NO_TOKEN");
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "You do not have permission to perform this action", "FORBIDDEN");
    }
    next();
  };

module.exports = { authenticate, attachUserIfPresent, authorize };
