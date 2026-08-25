const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrder,
  trackOrder,
  getMyOrders,
  getMyOrderById,
} = require("../controllers/orderController");

const {
  authenticate,
  attachUserIfPresent,
} = require("../middleware/auth");

const validateRequest = require("../middleware/validateRequest");

const { createOrderSchema } = require("../validators/orderValidator");

const { orderLimiter } = require("../middleware/rateLimiter");

// Guest checkout allowed
router.post(
  "/",
  orderLimiter,
  attachUserIfPresent,
  validateRequest(createOrderSchema),
  createOrder
);

// Logged-in user's orders
router.get(
  "/my-orders",
  authenticate,
  getMyOrders
);

// Logged-in user's specific order
router.get(
  "/my-orders/:orderId",
  authenticate,
  getMyOrderById
);

// Public order tracking
router.get(
  "/track/:orderNumber",
  trackOrder
);

// Existing single-order endpoint
router.get(
  "/:orderId",
  getOrder
);

module.exports = router;