const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
} = require("../controllers/paymentController");

router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
// NOTE: mounted with express.raw() body parsing in app.js for signature verification
router.post("/razorpay/webhook", razorpayWebhook);

module.exports = router;
