const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

// Every route below requires a valid JWT AND an ADMIN or STAFF role.
router.use(authenticate, authorize("ADMIN", "STAFF"));

router.use("/orders", require("./orderRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/delivery-zones", require("./deliveryZoneRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/bulk-orders", require("./bulkOrderRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/settings", require("./settingsRoutes"));

module.exports = router;
