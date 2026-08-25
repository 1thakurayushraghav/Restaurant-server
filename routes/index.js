const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/delivery", require("./deliveryRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/bulk-orders", require("./bulkOrderRoutes"));
router.use("/whatsapp", require("./whatsappRoutes"));
router.use("/restaurant", require("./restaurantRoutes"));
router.use("/admin", require("./admin/index"));

module.exports = router;
