const express = require("express");
const router = express.Router();
const {
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require("../../controllers/categoryController");
const validateRequest = require("../../middleware/validateRequest");
const {
  createCategorySchema,
  updateCategorySchema,
  reorderSchema,
} = require("../../validators/categoryValidator");

router.get("/", adminGetCategories);
router.post("/", validateRequest(createCategorySchema), createCategory);
router.patch("/reorder", validateRequest(reorderSchema), reorderCategories);
router.patch("/:id", validateRequest(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
