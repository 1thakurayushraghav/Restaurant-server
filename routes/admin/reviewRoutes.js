const express = require("express");
const router = express.Router();
const { adminGetReviews, updateReviewStatus } = require("../../controllers/reviewController");
const validateRequest = require("../../middleware/validateRequest");
const { updateReviewStatusSchema } = require("../../validators/miscValidators");

router.get("/", adminGetReviews);
router.patch("/:id/status", validateRequest(updateReviewStatusSchema), updateReviewStatus);

module.exports = router;
