const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minimumOrder: { type: Number, default: 0 },
    deliveryFee: { type: Number, required: true },
    freeDeliveryAbove: { type: Number },
    estimatedTime: { type: String, default: "30-45 mins" },
    radius: { type: Number }, // km, informational
    areas: { type: [String], default: [] }, // matched against checkout "area" field
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);
