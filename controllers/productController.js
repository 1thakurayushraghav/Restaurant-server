const { Product, Category } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// Public: GET /api/products?category=&isVeg=&isBestseller=&isFeatured=&sort=&page=&limit=
const getProducts = asyncHandler(async (req, res) => {
  const { category, isVeg, isBestseller, isFeatured, sort, page = 1, limit = 20 } = req.query;

  const filter = { isAvailable: true };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else return sendSuccess(res, { products: [] }, 200, { total: 0, page: Number(page), pages: 0 });
  }
  if (isVeg === "true") filter.isVeg = true;
  if (isBestseller === "true") filter.isBestseller = true;
  if (isFeatured === "true") filter.isFeatured = true;

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { "variants.0.price": 1 };
  if (sort === "price_desc") sortOption = { "variants.0.price": -1 };
  if (sort === "name_asc") sortOption = { name: 1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, { products }, 200, {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// Public: GET /api/products/search?q=
const searchProducts = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;
  if (!q.trim()) return sendSuccess(res, { products: [] });

  const products = await Product.find({
    isAvailable: true,
    $text: { $search: q },
  })
    .populate("category", "name slug")
    .limit(30);

  sendSuccess(res, { products });
});

// Public: GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  sendSuccess(res, { product });
});

// Admin: GET /api/admin/products (includes unavailable items)
const adminGetProducts = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 30, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, { products }, 200, { total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

const createProduct = asyncHandler(async (req, res) => {
  const existing = await Product.findOne({ slug: req.body.slug });
  if (existing) throw new ApiError(409, "A product with this slug already exists", "SLUG_EXISTS");

  const category = await Category.findById(req.body.category);
  if (!category) throw new ApiError(400, "Selected category does not exist", "CATEGORY_NOT_FOUND");

  const product = await Product.create(req.body);
  sendSuccess(res, { product }, 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) throw new ApiError(400, "Selected category does not exist", "CATEGORY_NOT_FOUND");
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  sendSuccess(res, { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  sendSuccess(res, { message: "Product deleted" });
});

module.exports = {
  getProducts,
  searchProducts,
  getProductBySlug,
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
