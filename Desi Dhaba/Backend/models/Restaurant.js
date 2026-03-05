const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    cuisine: {
      type: [String],
      default: [],
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
    deliveryTime: {
      type: String,
      default: "30-40 min",
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    openingHours: {
      type: String,
      default: "9:00 AM - 11:00 PM",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
