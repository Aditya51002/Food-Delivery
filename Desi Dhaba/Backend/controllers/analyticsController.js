const Order = require("../models/Order");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const FoodItem = require("../models/FoodItem");

// ─── Get Dashboard Overview ────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalRestaurants, totalFoods, deliveredOrders, pendingOrders] =
      await Promise.all([
        Order.countDocuments(),
        User.countDocuments({ role: "user" }),
        Restaurant.countDocuments(),
        FoodItem.countDocuments(),
        Order.countDocuments({ status: "Delivered" }),
        Order.countDocuments({ status: "Pending" }),
      ]);

    // Total revenue (from delivered orders only)
    const revenueAgg = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const todayRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    res.json({
      totalOrders,
      totalUsers,
      totalRestaurants,
      totalFoods,
      deliveredOrders,
      pendingOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Revenue Chart (last 7 days) ─────────────────────────────────────────────
const getRevenueChart = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: "Delivered" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Fill in missing days with 0
    const chartData = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const found = data.find(
        (x) =>
          x._id.year === d.getFullYear() &&
          x._id.month === d.getMonth() + 1 &&
          x._id.day === d.getDate()
      );
      chartData.push({ date: label, revenue: found?.revenue || 0, orders: found?.orders || 0 });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Order Status Distribution ────────────────────────────────────────────────
const getOrderStatusDistribution = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const result = data.map((d) => ({ status: d._id, count: d.count }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Top Selling Items ────────────────────────────────────────────────────────
const getTopItems = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardStats, getRevenueChart, getOrderStatusDistribution, getTopItems };
