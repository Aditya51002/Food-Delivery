const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    items: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        isVeg: { type: Boolean, default: true },
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: "",
    },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
    },
    orderNote: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    cancelReason: {
      type: String,
      default: "",
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
