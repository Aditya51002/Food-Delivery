const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const mongoose = require("mongoose");

const TAX_RATE = 0.05;
const DELIVERY_FEE_BASE = 30;
const FREE_DELIVERY_THRESHOLD = 500;

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const { deliveryAddress, paymentMethod, orderNote, couponCode } = req.body;

      const cart = await Cart.findOne({ userId: req.user._id })
        .populate("items.foodId")
        .session(session);

      if (!cart || cart.items.length === 0) {
        throw Object.assign(new Error("Your cart is empty"), { statusCode: 400 });
      }

      const orderItems = cart.items
        .filter((item) => item.foodId && item.foodId.isAvailable)
        .map((item) => ({
          foodId: item.foodId._id,
          name: item.foodId.name,
          price: item.foodId.price,
          quantity: item.quantity,
          image: item.foodId.image || "",
          isVeg: item.foodId.isVeg ?? true,
        }));

      if (orderItems.length === 0) {
        throw Object.assign(
          new Error("No available items in your cart. Some items may have been removed."),
          { statusCode: 400 }
        );
      }

      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_BASE;
      const taxAmount = Math.round(subtotal * TAX_RATE);

      let discount = 0;
      let appliedCouponCode = "";

      if (couponCode && couponCode.trim()) {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase().trim(),
          isActive: true,
        }).session(session);

        if (coupon && (!coupon.expiresAt || new Date() <= coupon.expiresAt)) {
          if (subtotal >= coupon.minOrderAmount) {
            const userUsage = coupon.usedBy.filter(
              (u) => u.userId.toString() === req.user._id.toString()
            ).length;

            const globalUsageOk = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

            if (userUsage < coupon.perUserLimit && globalUsageOk) {
              if (coupon.discountType === "percentage") {
                discount = (subtotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
              } else {
                discount = coupon.discountValue;
              }
              discount = Math.round(Math.min(discount, subtotal));
              appliedCouponCode = coupon.code;

              await Coupon.findByIdAndUpdate(
                coupon._id,
                {
                  $push: { usedBy: { userId: req.user._id } },
                  $inc: { usedCount: 1 },
                },
                { session }
              );
            }
          }
        }
      }

      const totalAmount = Math.max(0, subtotal + deliveryFee + taxAmount - discount);
      const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);
      const paymentStatus = "Pending";

      [createdOrder] = await Order.create(
        [
          {
            userId: req.user._id,
            items: orderItems,
            subtotal,
            deliveryFee,
            taxAmount,
            discount,
            totalAmount,
            couponCode: appliedCouponCode,
            deliveryAddress: deliveryAddress.trim(),
            orderNote: orderNote?.trim() || "",
            paymentMethod: paymentMethod || "COD",
            paymentStatus,
            status: "Pending",
            estimatedDelivery,
            timeline: [{ status: "Pending", note: "Order placed successfully" }],
          },
        ],
        { session }
      );

      await Cart.findByIdAndUpdate(
        cart._id,
        { items: [], totalAmount: 0 },
        { session }
      );
    });

    if (!createdOrder) {
      return res.status(500).json({ message: "Order could not be created. Please try again." });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Server error" });
  } finally {
    session.endSession();
  }
};

const getUserOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments({ userId: req.user._id }),
      Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id).populate("userId", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "Cancelled";
    order.cancelReason = req.body.reason?.trim() || "Cancelled by customer";
    order.timeline.push({ status: "Cancelled", note: order.cancelReason });
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const filter = {};
    if (status && status !== "All") filter.status = status;

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const { get: getIO } = require("../lib/socket");

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.timeline.push({ status, note: note?.trim() || "" });

    if (status === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    const populated = await Order.findById(order._id).populate("userId", "name email");

    const io = getIO();
    if (io) {
      io.to(`order_${populated._id}`).emit("order:updated", {
        status: populated.status,
        paymentStatus: populated.paymentStatus,
        timeline: populated.timeline,
      });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const reorder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const FoodItem = require("../models/FoodItem");
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, items: [], totalAmount: 0 });

    const foodIds = order.items.map((i) => i.foodId).filter(Boolean);
    const foods = await FoodItem.find({ _id: { $in: foodIds }, isAvailable: true });
    const foodMap = {};
    foods.forEach((f) => { foodMap[f._id.toString()] = f; });

    let addedCount = 0;
    for (const item of order.items) {
      if (!item.foodId) continue;
      const food = foodMap[item.foodId.toString()];
      if (!food) continue;

      const idx = cart.items.findIndex((i) => i.foodId.toString() === item.foodId.toString());
      if (idx > -1) {
        cart.items[idx].quantity = Math.min(cart.items[idx].quantity + item.quantity, 50);
      } else {
        cart.items.push({ foodId: item.foodId, quantity: Math.min(item.quantity, 50) });
      }
      addedCount++;
    }

    if (addedCount === 0) {
      return res.status(400).json({ message: "No available items from this order to reorder" });
    }

    const priceMap = {};
    foods.forEach((f) => { priceMap[f._id.toString()] = f.price; });
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (priceMap[item.foodId.toString()] || 0) * item.quantity;
    }, 0);

    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  placeOrder, getUserOrders, getOrderById,
  cancelOrder, getAllOrders, updateOrderStatus, reorder,
};
