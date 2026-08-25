const { Review, Notification } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// Public: GET /api/reviews/approved
const getApprovedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ status: "APPROVED" }).sort({ createdAt: -1 }).limit(50);
  sendSuccess(res, { reviews });
});

// Public: POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, status: "PENDING" });
  await Notification.create({
    type: "NEW_REVIEW",
    message: `New review from ${review.customer.name} (${review.rating}★) awaiting approval`,
  });
  sendSuccess(res, { review, message: "Thank you! Your review will be visible after approval." }, 201);
});

// Admin
const adminGetReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, { reviews });
});

const updateReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!review) throw new ApiError(404, "Review not found", "REVIEW_NOT_FOUND");
  sendSuccess(res, { review });
});

module.exports = { getApprovedReviews, createReview, adminGetReviews, updateReviewStatus };
