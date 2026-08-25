const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
