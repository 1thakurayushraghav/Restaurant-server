const Razorpay = require("razorpay");

let instance = null;

function getRazorpayInstance() {
  if (instance) return instance;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null; // Razorpay not configured yet — COD/UPI-manual still works
  }

  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return instance;
}

module.exports = getRazorpayInstance;
