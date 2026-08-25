const express = require("express");
const router = express.Router();
const { getApprovedReviews, createReview } = require("../controllers/reviewController");
const validateRequest = require("../middleware/validateRequest");
const { createReviewSchema } = require("../validators/miscValidators");

router.get("/approved", getApprovedReviews);
router.post("/", validateRequest(createReviewSchema), createReview);

module.exports = router;
