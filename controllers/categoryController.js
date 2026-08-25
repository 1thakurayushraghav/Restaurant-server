const { Category, Product } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
  sendSuccess(res, { categories });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw new ApiError(404, "Category not found", "CATEGORY_NOT_FOUND");
  sendSuccess(res, { category });
});

// Admin
const adminGetCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 });
  sendSuccess(res, { categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findOne({ slug: req.body.slug });
  if (existing) throw new ApiError(409, "A category with this slug already exists", "SLUG_EXISTS");

  const category = await Category.create(req.body);
  sendSuccess(res, { category }, 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found", "CATEGORY_NOT_FOUND");
  sendSuccess(res, { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    throw new ApiError(400, "Cannot delete a category that has products. Reassign or delete products first.", "CATEGORY_IN_USE");
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found", "CATEGORY_NOT_FOUND");
  sendSuccess(res, { message: "Category deleted" });
});

const reorderCategories = asyncHandler(async (req, res) => {
  const { order } = req.body; // [{id, sortOrder}]
  await Promise.all(
    order.map(({ id, sortOrder }) => Category.findByIdAndUpdate(id, { sortOrder }))
  );
  const categories = await Category.find().sort({ sortOrder: 1 });
  sendSuccess(res, { categories });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
