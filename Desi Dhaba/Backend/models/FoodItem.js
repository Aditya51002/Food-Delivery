const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: [true, "Food item name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    numRatings: {
      type: Number,
      default: 0,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    spicyLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra-hot"],
      default: "mild",
    },
    preparationTime: {
      type: String,
      default: "15-20 min",
    },
    calories: {
      type: Number,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

foodItemSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("FoodItem", foodItemSchema);
