const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { get: getIO } = require("../lib/socket");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "Order ID is required" });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized to pay for this order" });
    if (order.paymentMethod !== "Online" || order.paymentStatus === "Paid") return res.status(400).json({ message: "Order is already paid or is COD" });
    const options = { amount: Math.round(order.totalAmount * 100), currency: "INR", receipt: `receipt_order_${order._id}` };
    const rzpOrder = await razorpay.orders.create(options);
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
    res.json({ id: rzpOrder.id, currency: rzpOrder.currency, amount: rzpOrder.amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) return res.status(400).json({ message: "Missing payment verification parameters" });
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: "Invalid payment signature" });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "Paid") return res.status(400).json({ message: "Order is already marked as paid" });
    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.status = "Confirmed";
    order.timeline.push({ status: "Confirmed", note: "Online payment successful" });
    await order.save();
    const io = getIO();
    if (io) {
      io.to(`order_${order._id}`).emit("order:updated", { status: order.status, paymentStatus: order.paymentStatus, timeline: order.timeline });
      io.to("admin_room").emit("admin:order_update", order);
    }
    res.json({ message: "Payment verified successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
