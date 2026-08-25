const { Restaurant } = require("../../models");
const { sendSuccess } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// GET /api/admin/settings (also used publicly via /api/settings, see restaurantController)
const getSettings = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findOne();
  if (!restaurant) restaurant = await Restaurant.create({});
  sendSuccess(res, { restaurant });
});

const updateSettings = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findOne();
  if (!restaurant) {
    restaurant = await Restaurant.create(req.body);
  } else {
    Object.assign(restaurant, req.body);
    await restaurant.save();
  }
  sendSuccess(res, { restaurant });
});

module.exports = { getSettings, updateSettings };
