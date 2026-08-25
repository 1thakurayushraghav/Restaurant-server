const express = require("express");
const router = express.Router();
const { register, login, getMe, logout } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, validateRequest(registerSchema), register);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

module.exports = router;
