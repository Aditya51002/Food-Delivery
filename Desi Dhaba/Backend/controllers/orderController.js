const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

const TAX_RATE = 0.05; // 5% GST
const DELIVERY_FEE_BASE = 30;

const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, orderNote, couponCode } = req.body;

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.foodId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const orderItems = cart.items
      .filter((item) => item.foodId)
      .map((item) => ({
        foodId: item.foodId._id,
        name: item.foodId.name,
        price: item.foodId.price,
        quantity: item.quantity,
        image: item.foodId.image || "",
        isVeg: item.foodId.isVeg ?? true,
      }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 500 ? 0 : DELIVERY_FEE_BASE;
    const taxAmount = Math.round(subtotal * TAX_RATE);

    let discount = 0;
    let appliedCouponCode = "";
    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
      if (coupon && (!coupon.expiresAt || new Date() <= coupon.expiresAt)) {
        if (subtotal >= coupon.minOrderAmount) {
          const userUsage = coupon.usedBy.filter(
            (u) => u.userId.toString() === req.user._id.toString()
          ).length;
          if (userUsage < coupon.perUserLimit) {
            if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
              if (coupon.discountType === "percentage") {
                discount = (subtotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
              } else {
                discount = coupon.discountValue;
              }
              discount = Math.round(Math.min(discount, subtotal));
              appliedCouponCode = coupon.code;
              coupon.usedBy.push({ userId: req.user._id });
              coupon.usedCount += 1;
              await coupon.save();
            }
          }
        }
      }
    }

    const totalAmount = subtotal + deliveryFee + taxAmount - discount;
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000); // 45 min from now

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      taxAmount,
      discount,
      totalAmount,
      couponCode: appliedCouponCode,
      deliveryAddress: deliveryAddress.trim(),
      orderNote: orderNote || "",
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
      status: "Pending",
      estimatedDelivery,
      timeline: [{ status: "Pending", note: "Order placed successfully" }],
    });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ userId: req.user._id });
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "Cancelled";
    order.cancelReason = req.body.reason || "Cancelled by customer";
    order.timeline.push({ status: "Cancelled", note: order.cancelReason });
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== "All") filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.timeline.push({ status, note: note || "" });

    if (status === "Delivered") {
      order.paymentStatus = "Paid";
    }

    await order.save();
    const populated = await Order.findById(order._id).populate("userId", "name email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const reorder = async (req, res) => {
  try {
    const FoodItem = require("../models/FoodItem");

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, items: [], totalAmount: 0 });

    let addedCount = 0;
    for (const item of order.items) {
      if (!item.foodId) continue;
      const food = await FoodItem.findById(item.foodId);
      if (!food || !food.isAvailable) continue;

      const idx = cart.items.findIndex((i) => i.foodId.toString() === item.foodId.toString());
      if (idx > -1) {
        cart.items[idx].quantity += item.quantity;
      } else {
        cart.items.push({ foodId: item.foodId, quantity: item.quantity });
      }
      addedCount++;
    }

    if (addedCount === 0) {
      return res.status(400).json({ message: "No available items from this order to reorder" });
    }

    let total = 0;
    for (const cartItem of cart.items) {
      const food = await FoodItem.findById(cartItem.foodId);
      if (food) total += food.price * cartItem.quantity;
    }
    cart.totalAmount = total;
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { placeOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, reorder };
