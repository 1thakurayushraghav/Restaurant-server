const { Coupon, Order } = require("../models");
const { ApiError } = require("../utils/apiResponse");

/**
 * Validates a coupon code against current date, usage limits, and minimum order.
 * Returns { coupon, discount, freeDelivery }
 */
async function validateAndComputeDiscount(code, subtotal, phone) {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });

  if (!coupon) {
    throw new ApiError(400, "Invalid coupon code", "COUPON_INVALID");
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new ApiError(400, "This coupon has expired or is not yet active", "COUPON_EXPIRED");
  }

  if (subtotal < coupon.minimumOrder) {
    throw new ApiError(
      400,
      `Minimum order of ₹${coupon.minimumOrder} required for this coupon`,
      "COUPON_MIN_ORDER_NOT_MET"
    );
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit", "COUPON_LIMIT_REACHED");
  }

  if (phone && coupon.perUserLimit) {
    const priorUses = await Order.countDocuments({
      "customer.phone": phone,
      couponCode: coupon.code,
      status: { $nin: ["CANCELLED"] },
    });
    if (priorUses >= coupon.perUserLimit) {
      throw new ApiError(400, "You have already used this coupon", "COUPON_USER_LIMIT_REACHED");
    }
  }

  let discount = 0;
  let freeDelivery = false;

  if (coupon.type === "PERCENTAGE") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  } else if (coupon.type === "FIXED") {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === "FREE_DELIVERY") {
    freeDelivery = true;
  }

  return { coupon, discount: Math.round(discount), freeDelivery };
}

module.exports = { validateAndComputeDiscount };
