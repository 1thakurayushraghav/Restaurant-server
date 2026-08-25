const crypto = require("crypto");
const getRazorpayInstance = require("../config/razorpay");
const { Order, Payment } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/payments/razorpay/create-order  { orderId }
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new ApiError(503, "Online payments are not configured yet. Please choose Cash on Delivery.", "PAYMENTS_NOT_CONFIGURED");
  }

  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  if (order.paymentStatus === "PAID") {
    throw new ApiError(400, "This order has already been paid", "ALREADY_PAID");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100), // paise
    currency: "INR",
    receipt: order.orderNumber,
  });

  await Payment.create({
    order: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: order.total,
    status: "CREATED",
  });

  sendSuccess(res, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /api/payments/razorpay/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature }
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification details", "MISSING_PAYMENT_FIELDS");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) throw new ApiError(404, "Payment record not found", "PAYMENT_NOT_FOUND");

  if (!isValid) {
    payment.status = "FAILED";
    await payment.save();
    throw new ApiError(400, "Payment verification failed", "SIGNATURE_MISMATCH");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "PAID";
  payment.verifiedAt = new Date();
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    paymentStatus: "PAID",
    status: "CONFIRMED",
  });

  sendSuccess(res, { message: "Payment verified successfully" });
});

// POST /api/payments/razorpay/webhook — Razorpay server-to-server event
// NOTE: this route is mounted with express.raw() in app.js, so req.body is a Buffer here.
const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body; // Buffer

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(rawBody)
    .digest("hex");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET || signature !== expectedSignature) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  const payload = JSON.parse(rawBody.toString("utf8"));
  const event = payload.event;

  if (event === "payment.captured") {
    const paymentEntity = payload.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
    if (payment && payment.status !== "PAID") {
      payment.status = "PAID";
      payment.razorpayPaymentId = paymentEntity.id;
      payment.verifiedAt = new Date();
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { paymentStatus: "PAID", status: "CONFIRMED" });
    }
  }

  if (event === "payment.failed") {
    const paymentEntity = payload.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
    if (payment) {
      payment.status = "FAILED";
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { paymentStatus: "FAILED" });
    }
  }

  res.status(200).json({ received: true });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook };
