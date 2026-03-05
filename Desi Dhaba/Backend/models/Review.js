const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["restaurant", "food"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
