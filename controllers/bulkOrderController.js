const { BulkOrder, Notification } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// Public: POST /api/bulk-orders
const createBulkOrder = asyncHandler(async (req, res) => {
  const enquiry = await BulkOrder.create(req.body);
  await Notification.create({
    type: "BULK_ENQUIRY",
    message: `New bulk order enquiry from ${enquiry.name} for ${enquiry.eventType}`,
  });
  sendSuccess(res, { enquiry, message: "Thank you! We'll get back to you shortly." }, 201);
});

// Admin
const adminGetBulkOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const enquiries = await BulkOrder.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, { enquiries });
});

const updateBulkOrderStatus = asyncHandler(async (req, res) => {
  const enquiry = await BulkOrder.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!enquiry) throw new ApiError(404, "Enquiry not found", "BULK_ORDER_NOT_FOUND");
  sendSuccess(res, { enquiry });
});

module.exports = { createBulkOrder, adminGetBulkOrders, updateBulkOrderStatus };
