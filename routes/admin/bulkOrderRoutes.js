const express = require("express");
const router = express.Router();
const { adminGetBulkOrders, updateBulkOrderStatus } = require("../../controllers/bulkOrderController");
const validateRequest = require("../../middleware/validateRequest");
const { updateBulkOrderStatusSchema } = require("../../validators/miscValidators");

router.get("/", adminGetBulkOrders);
router.patch("/:id/status", validateRequest(updateBulkOrderStatusSchema), updateBulkOrderStatus);

module.exports = router;
