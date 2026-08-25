const express = require("express");
const router = express.Router();
const { getPublicRestaurantInfo } = require("../controllers/restaurantController");

router.get("/", getPublicRestaurantInfo);

module.exports = router;
