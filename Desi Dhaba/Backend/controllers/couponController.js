const Coupon = require("../models/Coupon");
const { body } = require("express-validator");

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });
    const amount = parseFloat(orderAmount);
    if (isNaN(amount) || amount < 0) return res.status(400).json({ message: "Invalid order amount" });
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    if (!coupon.isActive) return res.status(400).json({ message: "This coupon is no longer active" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ message: "This coupon has expired" });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: "This coupon has reached its usage limit" });
    if (amount < coupon.minOrderAmount) return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` });
    const userUsageCount = coupon.usedBy.filter((u) => u.userId.toString() === req.user._id.toString()).length;
    if (userUsageCount >= coupon.perUserLimit) return res.status(400).json({ message: "You have already used this coupon the maximum number of times" });
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.round(Math.min(discount, amount));
    res.json({ valid: true, coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue, maxDiscount: coupon.maxDiscount }, discount, message: `Coupon applied! You save ₹${discount}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const total = await Coupon.countDocuments();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select("-usedBy");
    res.json({ coupons, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, maxDiscount, minOrderAmount, usageLimit, perUserLimit, isActive, expiresAt, applicableFor } = req.body;
    if (!code || !discountType || discountValue === undefined) return res.status(400).json({ message: "Code, discount type, and discount value are required" });
    if (!["percentage", "fixed"].includes(discountType)) return res.status(400).json({ message: "discountType must be 'percentage' or 'fixed'" });
    if (discountType === "percentage" && (parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100)) return res.status(400).json({ message: "Percentage discount must be between 1 and 100" });
    const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (exists) return res.status(400).json({ message: "Coupon code already exists" });
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(), description: description || "", discountType,
      discountValue: parseFloat(discountValue), maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      minOrderAmount: parseFloat(minOrderAmount) || 0, usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: parseInt(perUserLimit) || 1,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null, applicableFor: applicableFor || "all",
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    const stringFields = ["description", "discountType", "applicableFor"];
    stringFields.forEach((f) => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });
    const numberFields = ["discountValue", "maxDiscount", "minOrderAmount", "usageLimit", "perUserLimit"];
    numberFields.forEach((f) => { if (req.body[f] !== undefined) coupon[f] = req.body[f] === null ? null : parseFloat(req.body[f]); });
    if (req.body.isActive !== undefined) coupon.isActive = req.body.isActive === "true" || req.body.isActive === true;
    if (req.body.expiresAt !== undefined) coupon.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    const updated = await coupon.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
