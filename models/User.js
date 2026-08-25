const mongoose = require("mongoose");

const addressSubSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    addressLine: { type: String, required: true },
    area: { type: String },
    landmark: { type: String },
    pincode: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["CUSTOMER", "ADMIN", "STAFF"],
      default: "CUSTOMER",
    },
    addresses: [addressSubSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
