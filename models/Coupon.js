const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["PERCENTAGE", "FIXED", "FREE_DELIVERY"], required: true },
    value: { type: Number, default: 0 }, // % or flat amount; ignored for FREE_DELIVERY
    minimumOrder: { type: Number, default: 0 },
    maximumDiscount: { type: Number }, // cap for PERCENTAGE type
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number }, // total uses allowed, null = unlimited
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
