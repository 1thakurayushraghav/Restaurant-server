const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getRevenue,
  getTopProducts,
  getOrderSources,
} = require("../../controllers/admin/analyticsController");

router.get("/dashboard", getDashboard);
router.get("/revenue", getRevenue);
router.get("/top-products", getTopProducts);
router.get("/order-sources", getOrderSources);

module.exports = router;
