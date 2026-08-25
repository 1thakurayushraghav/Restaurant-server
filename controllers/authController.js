const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { signToken } = require("../utils/token");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;

  const existing = await User.findOne({ phone });
  if (existing) {
    throw new ApiError(409, "An account with this phone number already exists", "PHONE_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, email, passwordHash, role: "CUSTOMER" });

  const token = signToken({ id: user._id, role: user.role });

  sendSuccess(
    res,
    {
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
    },
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "Invalid phone number or password", "INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid phone number or password", "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated", "ACCOUNT_INACTIVE");
  }

  const token = signToken({ id: user._id, role: user.role });

  sendSuccess(res, {
    token,
    user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
  });
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      role: req.user.role,
      addresses: req.user.addresses,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT — client discards the token. Endpoint kept for symmetry / future blacklist support.
  sendSuccess(res, { message: "Logged out" });
});

module.exports = { register, login, getMe, logout };
