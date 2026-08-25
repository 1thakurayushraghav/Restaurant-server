const { DeliveryZone } = require("../models");
const { ApiError } = require("../utils/apiResponse");

/**
 * Finds the matching active delivery zone for a given area/pincode and computes the fee.
 * Falls back to the first active zone marked as default-like (no areas[] restriction) if no match.
 */
async function resolveDeliveryZone({ area, pincode }) {
  const zones = await DeliveryZone.find({ isActive: true });

  if (zones.length === 0) return null;

  const normalizedArea = (area || "").trim().toLowerCase();

  let match = zones.find((z) =>
    z.areas.some((a) => a.trim().toLowerCase() === normalizedArea)
  );

  if (!match) {
    // fallback: a zone with no specific areas listed acts as the general/default zone
    match = zones.find((z) => z.areas.length === 0);
  }

  return match || null;
}

/**
 * Computes delivery fee for a given subtotal + zone, honoring minimum order and free-delivery threshold.
 */
function calculateDeliveryFee(zone, subtotal) {
  if (!zone) {
    throw new ApiError(400, "Delivery is not available for this area yet", "DELIVERY_UNAVAILABLE");
  }
  if (zone.minimumOrder && subtotal < zone.minimumOrder) {
    throw new ApiError(
      400,
      `Minimum order for delivery in this area is ₹${zone.minimumOrder}`,
      "MINIMUM_ORDER_NOT_MET"
    );
  }
  if (zone.freeDeliveryAbove && subtotal >= zone.freeDeliveryAbove) {
    return 0;
  }
  return zone.deliveryFee;
}

module.exports = { resolveDeliveryZone, calculateDeliveryFee };
