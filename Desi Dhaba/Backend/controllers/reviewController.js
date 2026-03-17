const Review = require("../models/Review");
const FoodItem = require("../models/FoodItem");
const Restaurant = require("../models/Restaurant");

const updateTargetRating = async (targetType, targetId) => {
  const agg = await Review.aggregate([
    { $match: { targetType, targetId: targetId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avgRating = agg[0]?.avgRating || 0;
  const numRatings = agg[0]?.count || 0;

  if (targetType === "food") {
    await FoodItem.findByIdAndUpdate(targetId, { rating: parseFloat(avgRating.toFixed(1)), numRatings });
  } else if (targetType === "restaurant") {
    await Restaurant.findByIdAndUpdate(targetId, { rating: parseFloat(avgRating.toFixed(1)), numRatings });
  }
};

const createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, title, comment, orderId } = req.body;

    if (!targetType || !targetId || !rating) {
      return res.status(400).json({ message: "targetType, targetId, and rating are required" });
    }

    const existing = await Review.findOne({ userId: req.user._id, targetType, targetId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this item" });
    }

    const review = await Review.create({
      userId: req.user._id,
      targetType,
      targetId,
      orderId: orderId || null,
      rating: parseInt(rating),
      title: title || "",
      comment: comment || "",
    });

    await updateTargetRating(targetType, targetId);

    const populated = await Review.findById(review._id).populate("userId", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ targetType, targetId });
    const reviews = await Review.find({ targetType, targetId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
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
