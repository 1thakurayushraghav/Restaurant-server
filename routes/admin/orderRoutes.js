const express = require("express");
const router = express.Router();
const {
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
} = require("../../controllers/orderController");
const validateRequest = require("../../middleware/validateRequest");
const { updateOrderStatusSchema } = require("../../validators/orderValidator");

router.get("/", adminGetOrders);
router.get("/:id", adminGetOrderById);
router.patch("/:id/status", validateRequest(updateOrderStatusSchema), adminUpdateOrderStatus);

module.exports = router;
