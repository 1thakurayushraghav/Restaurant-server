const express = require("express");
const router = express.Router();
const { createBulkOrder } = require("../controllers/bulkOrderController");
const validateRequest = require("../middleware/validateRequest");
const { createBulkOrderSchema } = require("../validators/miscValidators");

router.post("/", validateRequest(createBulkOrderSchema), createBulkOrder);

module.exports = router;
