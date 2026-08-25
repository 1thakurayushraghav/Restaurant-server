const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot at order time
    variantLabel: { type: String, required: true }, // snapshot
    variantId: { type: mongoose.Schema.Types.ObjectId },
    unitPrice: { type: Number, required: true }, // snapshot — server-verified
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    addressLine: { type: String },
    area: { type: String },
    landmark: { type: String },
    pincode: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true, index: true },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "UPI", "RAZORPAY"], required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    orderType: { type: String, enum: ["DELIVERY", "PICKUP"], required: true },
    deliveryAddress: deliveryAddressSchema,
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REFUND_PENDING",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },
    notes: { type: String, default: "" },
    source: {
      type: String,
      enum: ["WEBSITE", "WHATSAPP", "PHONE", "ADMIN", "OTHER"],
      default: "WEBSITE",
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customer.phone": 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
