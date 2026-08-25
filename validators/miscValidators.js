const { z } = require("zod");

const createCouponSchema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_DELIVERY"]),
  value: z.number().nonnegative().optional().default(0),
  minimumOrder: z.number().nonnegative().optional().default(0),
  maximumDiscount: z.number().nonnegative().optional(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional().default(1),
  categories: z.array(z.string()).optional().default([]),
  active: z.boolean().optional().default(true),
});
const updateCouponSchema = createCouponSchema.partial();

const validateCouponSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().nonnegative(),
  phone: z.string().optional(),
});

const createDeliveryZoneSchema = z.object({
  name: z.string().min(2),
  minimumOrder: z.number().nonnegative().optional().default(0),
  deliveryFee: z.number().nonnegative(),
  freeDeliveryAbove: z.number().nonnegative().optional(),
  estimatedTime: z.string().optional().default("30-45 mins"),
  radius: z.number().nonnegative().optional(),
  areas: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});
const updateDeliveryZoneSchema = createDeliveryZoneSchema.partial();

const checkDeliverySchema = z.object({
  area: z.string().optional(),
  pincode: z.string().optional(),
});

const createReviewSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().optional(),
  }),
  order: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});

const updateReviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

const createBulkOrderSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  eventType: z.enum(["WEDDING", "BIRTHDAY", "PARTY", "CORPORATE", "FESTIVAL", "RELIGIOUS", "RETURN_GIFTS", "OTHER"]),
  eventDate: z.string().optional(),
  peopleCount: z.number().int().positive().optional(),
  products: z.string().max(1000).optional().default(""),
  quantity: z.string().max(200).optional().default(""),
  location: z.string().max(200).optional().default(""),
  budget: z.string().max(100).optional().default(""),
  message: z.string().max(1000).optional().default(""),
});

const updateBulkOrderStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONFIRMED", "CLOSED"]),
});

module.exports = {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
  checkDeliverySchema,
  createReviewSchema,
  updateReviewStatusSchema,
  createBulkOrderSchema,
  updateBulkOrderStatusSchema,
};
