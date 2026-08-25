const express = require("express");
const router = express.Router();
const {
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/productController");
const validateRequest = require("../../middleware/validateRequest");
const { createProductSchema, updateProductSchema } = require("../../validators/productValidator");

router.get("/", adminGetProducts);
router.post("/", validateRequest(createProductSchema), createProduct);
router.patch("/:id", validateRequest(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
