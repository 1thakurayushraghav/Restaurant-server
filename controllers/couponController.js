const { Coupon } = require("../models");
const { validateAndComputeDiscount } = require("../services/couponService");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// Public: POST /api/coupons/validate { code, cartTotal, phone }
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal, phone } = req.body;
  const { coupon, discount, freeDelivery } = await validateAndComputeDiscount(code, cartTotal, phone);

  sendSuccess(res, {
    code: coupon.code,
    type: coupon.type,
    discount,
    freeDelivery,
  });
});

// Admin CRUD
const adminGetCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, { coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (existing) throw new ApiError(409, "A coupon with this code already exists", "COUPON_EXISTS");
  const coupon = await Coupon.create(req.body);
  sendSuccess(res, { coupon }, 201);
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, "Coupon not found", "COUPON_NOT_FOUND");
  sendSuccess(res, { coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found", "COUPON_NOT_FOUND");
  sendSuccess(res, { message: "Coupon deleted" });
});

module.exports = { validateCoupon, adminGetCoupons, createCoupon, updateCoupon, deleteCoupon };
