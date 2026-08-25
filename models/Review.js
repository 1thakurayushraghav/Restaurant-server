const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      phone: { type: String },
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
