const express = require("express");
const router = express.Router();
const {
  adminGetCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../../controllers/couponController");
const validateRequest = require("../../middleware/validateRequest");
const { createCouponSchema, updateCouponSchema } = require("../../validators/miscValidators");

router.get("/", adminGetCoupons);
router.post("/", validateRequest(createCouponSchema), createCoupon);
router.patch("/:id", validateRequest(updateCouponSchema), updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
