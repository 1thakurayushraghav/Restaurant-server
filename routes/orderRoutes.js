const express = require("express");
const router = express.Router();
const { createOrder, getOrder, trackOrder } = require("../controllers/orderController");
const { attachUserIfPresent } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { createOrderSchema } = require("../validators/orderValidator");
const { orderLimiter } = require("../middleware/rateLimiter");

// Guest checkout allowed — attachUserIfPresent links order to account if logged in, but doesn't require it
router.post("/", orderLimiter, attachUserIfPresent, validateRequest(createOrderSchema), createOrder);
router.get("/track/:orderNumber", trackOrder);
router.get("/:orderId", getOrder);

module.exports = router;
