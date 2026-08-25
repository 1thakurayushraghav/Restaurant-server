const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "250g", "500g", "1kg", "Regular"
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    sku: { type: String },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    images: { type: [String], default: [] },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Product must have at least one variant",
      },
    },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isAvailable: 1 });

// Virtual: lowest price across variants, useful for card display / sorting
productSchema.virtual("startingPrice").get(function () {
  if (!this.variants || this.variants.length === 0) return null;
  return Math.min(...this.variants.map((v) => v.price));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
