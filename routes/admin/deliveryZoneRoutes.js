const express = require("express");
const router = express.Router();
const {
  adminGetZones,
  createZone,
  updateZone,
  deleteZone,
} = require("../../controllers/deliveryController");
const validateRequest = require("../../middleware/validateRequest");
const {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
} = require("../../validators/miscValidators");

router.get("/", adminGetZones);
router.post("/", validateRequest(createDeliveryZoneSchema), createZone);
router.patch("/:id", validateRequest(updateDeliveryZoneSchema), updateZone);
router.delete("/:id", deleteZone);

module.exports = router;
