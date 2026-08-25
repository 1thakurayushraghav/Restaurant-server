const express = require("express");
const router = express.Router();
const { validateCoupon } = require("../controllers/couponController");
const validateRequest = require("../middleware/validateRequest");
const { validateCouponSchema } = require("../validators/miscValidators");

router.post("/validate", validateRequest(validateCouponSchema), validateCoupon);

module.exports = router;
