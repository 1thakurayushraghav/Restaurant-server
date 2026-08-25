const { User, Order } = require("../../models");
const { sendSuccess } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// GET /api/admin/customers — registered users, with order count/spend derived from Order collection
const getCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, q } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  // Aggregate order stats per phone for the returned page
  const phones = users.map((u) => u.phone);
  const stats = await Order.aggregate([
    { $match: { "customer.phone": { $in: phones }, status: { $ne: "CANCELLED" } } },
    { $group: { _id: "$customer.phone", orderCount: { $sum: 1 }, totalSpend: { $sum: "$total" } } },
  ]);
  const statsMap = new Map(stats.map((s) => [s._id, s]));

  const enriched = users.map((u) => ({
    ...u.toObject(),
    orderCount: statsMap.get(u.phone)?.orderCount || 0,
    totalSpend: statsMap.get(u.phone)?.totalSpend || 0,
  }));

  sendSuccess(res, { customers: enriched }, 200, { total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

module.exports = { getCustomers };
