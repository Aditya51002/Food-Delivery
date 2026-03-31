const Review = require("../models/Review");
const FoodItem = require("../models/FoodItem");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const mongoose = require("mongoose");

const updateTargetRating = async (targetType, targetId) => {
  const agg = await Review.aggregate([
    { $match: { targetType, targetId: new mongoose.Types.ObjectId(targetId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avgRating = parseFloat((agg[0]?.avgRating || 0).toFixed(1));
  const numRatings = agg[0]?.count || 0;
  if (targetType === "food") {
    await FoodItem.findByIdAndUpdate(targetId, { rating: avgRating, numRatings });
  } else if (targetType === "restaurant") {
    await Restaurant.findByIdAndUpdate(targetId, { rating: avgRating, numRatings });
  }
};

const populateReview = (query) => query.populate("userId", "name avatar");

const createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, title, comment, orderId } = req.body;
    if (targetType === "food") {
      const food = await FoodItem.findById(targetId);
      if (!food) return res.status(404).json({ message: "Food item not found" });
    } else {
      const restaurant = await Restaurant.findById(targetId);
      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    }
    const existing = await Review.findOne({ userId: req.user._id, targetType, targetId });
    if (existing) return res.status(409).json({ message: "You have already reviewed this item" });
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, userId: req.user._id });
      if (!order) return res.status(400).json({ message: "Invalid order reference" });
    }
    const review = await Review.create({
      userId: req.user._id, targetType, targetId,
      orderId: orderId || null, rating: parseInt(rating),
      title: title?.trim() || "", comment: comment?.trim() || "",
    });
    await updateTargetRating(targetType, targetId);
    const populated = await populateReview(Review.findById(review._id));
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already reviewed this item" });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    if (!["food", "restaurant"].includes(targetType)) return res.status(400).json({ message: "Invalid targetType" });
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "Invalid targetId" });
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const [total, reviews] = await Promise.all([
      Review.countDocuments({ targetType, targetId }),
      populateReview(Review.find({ targetType, targetId }).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    ]);
    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid review ID" });
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }
    const { targetType, targetId } = review;
    await Review.findByIdAndDelete(req.params.id);
    await updateTargetRating(targetType, targetId);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createReview, getReviews, deleteReview };
