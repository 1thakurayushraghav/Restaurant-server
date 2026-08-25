const express = require("express");
const router = express.Router();
const { getZones, checkDelivery } = require("../controllers/deliveryController");

router.get("/zones", getZones);
router.post("/check", checkDelivery);

module.exports = router;
