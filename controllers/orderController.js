const { Order, Restaurant, Notification } = require("../models");
const { buildVerifiedOrderItems } = require("../services/pricingService");
const { resolveDeliveryZone, calculateDeliveryFee } = require("../services/deliveryService");
const { validateAndComputeDiscount } = require("../services/couponService");
const { Coupon } = require("../models");
const generateOrderNumber = require("../utils/generateOrderNumber");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/orders — server recalculates EVERYTHING from the database
const createOrder = asyncHandler(async (req, res) => {
  const { customer, items, orderType, paymentMethod, deliveryAddress, couponCode, notes, source } = req.body;

  const restaurant = await Restaurant.findOne();
  if (restaurant && restaurant.manualOverrideClosed && !restaurant.scheduledOrderingEnabled) {
    throw new ApiError(400, "We're currently closed and not accepting orders right now.", "RESTAURANT_CLOSED");
  }

  if (orderType === "DELIVERY" && (!deliveryAddress || !deliveryAddress.addressLine)) {
    throw new ApiError(400, "Delivery address is required for delivery orders", "ADDRESS_REQUIRED");
  }

  // 1. Recalculate line items & subtotal from DB (never trust client prices)
  const { lineItems, subtotal } = await buildVerifiedOrderItems(items);

  // 2. Delivery fee
  let deliveryFee = 0;
  if (orderType === "DELIVERY") {
    const zone = await resolveDeliveryZone({
      area: deliveryAddress.area,
      pincode: deliveryAddress.pincode,
    });
    deliveryFee = calculateDeliveryFee(zone, subtotal);
  }

  // 3. Coupon
  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const result = await validateAndComputeDiscount(couponCode, subtotal, customer.phone);
    appliedCoupon = result.coupon;
    discount = result.discount;
    if (result.freeDelivery) deliveryFee = 0;
  }

  // 4. Tax (currently 0 — configurable in Settings if the business registers for GST)
  const tax = 0;

  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer,
    user: req.user ? req.user._id : undefined,
    items: lineItems,
    subtotal,
    discount,
    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    deliveryFee,
    tax,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
    orderType,
    deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : undefined,
    status: "PENDING",
    notes,
    source: source || "WEBSITE",
  });

  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    await appliedCoupon.save();
  }

  await Notification.create({
    type: "NEW_ORDER",
    message: `New order ${order.orderNumber} from ${customer.name} — ₹${total}`,
    relatedOrder: order._id,
  });

  sendSuccess(res, { order }, 201);
});

// GET /api/orders/:orderId — by Mongo _id or orderNumber
const getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({
    $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
  });
  if (!order) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  sendSuccess(res, { order });
});

// GET /api/orders/track/:orderNumber
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) throw new ApiError(404, "Order not found. Please check your order number.", "ORDER_NOT_FOUND");
  sendSuccess(res, { order });
});

// ---- Admin ----

// GET /api/admin/orders?status=&page=&limit=
const adminGetOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 30, phone } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (phone) filter["customer.phone"] = phone;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, { orders }, 200, { total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

const adminGetOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  sendSuccess(res, { order });
});

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUND_PENDING"],
  CANCELLED: [],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
};

// GET /api/orders/my-orders — logged-in user's orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  sendSuccess(res, { orders });
});

// GET /api/orders/my-orders/:orderId — logged-in user's specific order
const getMyOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const query = {
    user: req.user._id,
    $or: [],
  };

  if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: orderId });
  }

  query.$or.push({ orderNumber: orderId });

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found",
      "ORDER_NOT_FOUND"
    );
  }

  sendSuccess(res, { order });
});

const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");

  const { status: nextStatus } = req.body;
  const allowed = VALID_TRANSITIONS[order.status] || [];

  if (!allowed.includes(nextStatus)) {
    throw new ApiError(
      400,
      `Cannot move order from ${order.status} to ${nextStatus}`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  order.status = nextStatus;
  if (nextStatus === "DELIVERED" && order.paymentMethod === "COD") {
    order.paymentStatus = "PAID";
  }
  await order.save();

  sendSuccess(res, { order });
});

module.exports = {
  createOrder,
  getOrder,
  trackOrder,
  getMyOrders,
  getMyOrderById,
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
};
