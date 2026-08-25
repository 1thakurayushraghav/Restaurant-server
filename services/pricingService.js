const { Product } = require("../models");
const { ApiError } = require("../utils/apiResponse");

/**
 * Rebuilds order items and subtotal from the DATABASE, never trusting client-sent prices.
 * @param {Array<{product: string, variantId: string, quantity: number}>} items
 * @returns {Promise<{lineItems: Array, subtotal: number}>}
 */
async function buildVerifiedOrderItems(items) {
  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const lineItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(String(item.product));
    if (!product) {
      throw new ApiError(400, `Product not found: ${item.product}`, "PRODUCT_NOT_FOUND");
    }
    if (!product.isAvailable) {
      throw new ApiError(400, `${product.name} is currently unavailable`, "PRODUCT_UNAVAILABLE");
    }

    const variant = product.variants.id(item.variantId);
    if (!variant) {
      throw new ApiError(400, `Variant not found for ${product.name}`, "VARIANT_NOT_FOUND");
    }
    if (!variant.isAvailable) {
      throw new ApiError(400, `${product.name} (${variant.label}) is currently unavailable`, "VARIANT_UNAVAILABLE");
    }

    const lineTotal = variant.price * item.quantity;
    subtotal += lineTotal;

    lineItems.push({
      product: product._id,
      name: product.name,
      variantLabel: variant.label,
      variantId: variant._id,
      unitPrice: variant.price,
      quantity: item.quantity,
      lineTotal,
    });
  }

  return { lineItems, subtotal };
}

module.exports = { buildVerifiedOrderItems };
