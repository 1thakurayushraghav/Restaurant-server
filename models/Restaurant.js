const mongoose = require("mongoose");

const hoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      required: true,
    },
    open: { type: String, required: true }, // "08:30"
    close: { type: String, required: true }, // "22:00"
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "Shree Munnalal Halwai Sweets & Restaurant" },
    address: {
      type: String,
      required: true,
      default:
        "Near Bank of Baroda, Jahangirabad Chawraha, Sahaswan, Uttar Pradesh 243638, India",
    },
    phone: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    email: { type: String, default: "" },
    openingHours: { type: [hoursSchema], default: [] },
    isOpen: { type: Boolean, default: true },
    manualOverrideClosed: { type: Boolean, default: false },
    scheduledOrderingEnabled: { type: Boolean, default: false },
    mapCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
