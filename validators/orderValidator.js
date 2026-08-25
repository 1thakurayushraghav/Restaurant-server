const { z } = require("zod");

const cartItemSchema = z.object({
  product: z.string().min(1, "Product id is required"),
  variantId: z.string().min(1, "Variant id is required"),
  quantity: z.number().int().positive().max(50),
});

const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  }),
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
  orderType: z.enum(["DELIVERY", "PICKUP"]),
  paymentMethod: z.enum(["COD", "UPI", "RAZORPAY"]),
  deliveryAddress: z
    .object({
      addressLine: z.string().min(3).optional(),
      area: z.string().optional(),
      landmark: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional().default(""),
  source: z.enum(["WEBSITE", "WHATSAPP", "PHONE", "ADMIN", "OTHER"]).optional().default("WEBSITE"),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUND_PENDING",
    "REFUNDED",
  ]),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
