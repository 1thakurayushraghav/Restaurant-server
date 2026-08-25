const { Restaurant } = require("../models");
const { buildVerifiedOrderItems } = require("../services/pricingService");
const { buildWhatsAppOrderMessage, buildWhatsAppLink } = require("../services/whatsappService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/whatsapp/generate-order-message
// { customer, items, orderType, deliveryAddress }
const generateOrderMessage = asyncHandler(async (req, res) => {
  const { customer, items, orderType, deliveryAddress } = req.body;

  const restaurant = await Restaurant.findOne();
  const { lineItems, subtotal } = await buildVerifiedOrderItems(items);

  const message = buildWhatsAppOrderMessage({
    restaurantName: restaurant ? restaurant.name : "Shree Munnalal Halwai Sweets & Restaurant",
    customer,
    items: lineItems,
    total: subtotal,
    orderType,
    address: deliveryAddress,
  });

  const link = buildWhatsAppLink(restaurant ? restaurant.whatsappNumber : "", message);

  sendSuccess(res, { message, link });
});

module.exports = { generateOrderMessage };
