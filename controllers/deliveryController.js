const { DeliveryZone } = require("../models");
const { resolveDeliveryZone, calculateDeliveryFee } = require("../services/deliveryService");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// Public
const getZones = asyncHandler(async (req, res) => {
  const zones = await DeliveryZone.find({ isActive: true });
  sendSuccess(res, { zones });
});

// Public: POST /api/delivery/check { area, pincode, subtotal }
const checkDelivery = asyncHandler(async (req, res) => {
  const { area, pincode, subtotal = 0 } = req.body;
  const zone = await resolveDeliveryZone({ area, pincode });

  if (!zone) {
    return sendSuccess(res, { deliverable: false, message: "We do not deliver to this area yet." });
  }

  try {
    const fee = calculateDeliveryFee(zone, Number(subtotal));
    sendSuccess(res, {
      deliverable: true,
      zone: { name: zone.name, estimatedTime: zone.estimatedTime, minimumOrder: zone.minimumOrder },
      deliveryFee: fee,
    });
  } catch (err) {
    sendSuccess(res, { deliverable: true, error: err.message, code: err.code });
  }
});

// Admin CRUD
const adminGetZones = asyncHandler(async (req, res) => {
  const zones = await DeliveryZone.find().sort({ createdAt: -1 });
  sendSuccess(res, { zones });
});

const createZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.create(req.body);
  sendSuccess(res, { zone }, 201);
});

const updateZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!zone) throw new ApiError(404, "Delivery zone not found", "ZONE_NOT_FOUND");
  sendSuccess(res, { zone });
});

const deleteZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndDelete(req.params.id);
  if (!zone) throw new ApiError(404, "Delivery zone not found", "ZONE_NOT_FOUND");
  sendSuccess(res, { message: "Delivery zone deleted" });
});

module.exports = { getZones, checkDelivery, adminGetZones, createZone, updateZone, deleteZone };
