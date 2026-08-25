const mongoose = require("mongoose");

const bulkOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    eventType: {
      type: String,
      enum: ["WEDDING", "BIRTHDAY", "PARTY", "CORPORATE", "FESTIVAL", "RELIGIOUS", "RETURN_GIFTS", "OTHER"],
      required: true,
    },
    eventDate: { type: Date },
    peopleCount: { type: Number },
    products: { type: String, default: "" }, // free text description of desired products
    quantity: { type: String, default: "" },
    location: { type: String, default: "" },
    budget: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CONFIRMED", "CLOSED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BulkOrder", bulkOrderSchema);
