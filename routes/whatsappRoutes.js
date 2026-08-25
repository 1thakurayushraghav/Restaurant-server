const express = require("express");
const router = express.Router();
const { generateOrderMessage } = require("../controllers/whatsappController");

router.post("/generate-order-message", generateOrderMessage);

module.exports = router;
