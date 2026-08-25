const express = require("express");
const router = express.Router();
const { getCustomers } = require("../../controllers/admin/customerController");

router.get("/", getCustomers);

module.exports = router;
