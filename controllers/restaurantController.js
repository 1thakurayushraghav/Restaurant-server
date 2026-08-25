const { Restaurant } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/restaurant — public: hours, contact, open/closed state
const getPublicRestaurantInfo = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findOne();
  if (!restaurant) restaurant = await Restaurant.create({});

  sendSuccess(res, {
    restaurant: {
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      whatsappNumber: restaurant.whatsappNumber,
      openingHours: restaurant.openingHours,
      isOpen: restaurant.isOpen && !restaurant.manualOverrideClosed,
      scheduledOrderingEnabled: restaurant.scheduledOrderingEnabled,
      mapCoordinates: restaurant.mapCoordinates,
      socialLinks: restaurant.socialLinks,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
    },
  });
});

module.exports = { getPublicRestaurantInfo };
