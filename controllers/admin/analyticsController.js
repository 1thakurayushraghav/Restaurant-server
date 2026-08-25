const { Order, Product } = require("../../models");
const { sendSuccess } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getDashboard = asyncHandler(async (req, res) => {
  const today = startOfDay();

  const [todayOrders, todayRevenueAgg, pending, preparing, outForDelivery, delivered] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: "CANCELLED" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ status: "PENDING" }),
    Order.countDocuments({ status: "PREPARING" }),
    Order.countDocuments({ status: "OUT_FOR_DELIVERY" }),
    Order.countDocuments({ status: "DELIVERED", createdAt: { $gte: today } }),
  ]);

  sendSuccess(res, {
    todayOrders,
    todayRevenue: todayRevenueAgg[0]?.total || 0,
    pending,
    preparing,
    outForDelivery,
    delivered,
  });
});

const getRevenue = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 14;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: "CANCELLED" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(res, { series: data });
});

const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const data = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.lineTotal" },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: limit },
  ]);
  sendSuccess(res, { topProducts: data });
});

const getOrderSources = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: "$source", count: { $sum: 1 } } },
  ]);
  sendSuccess(res, { sources: data });
});

module.exports = { getDashboard, getRevenue, getTopProducts, getOrderSources };
