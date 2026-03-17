const Coupon = require("../models/Coupon");

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    if (!coupon.isActive) return res.status(400).json({ message: "This coupon is no longer active" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "This coupon has expired" });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    const userUsageCount = coupon.usedBy.filter(
      (u) => u.userId.toString() === req.user._id.toString()
    ).length;
    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, orderAmount);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: Math.round(discount),
      message: `Coupon applied! You saved ₹${Math.round(discount)}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, maxDiscount, minOrderAmount,
            usageLimit, perUserLimit, isActive, expiresAt, applicableFor } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: "Code, discount type, and discount value are required" });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (exists) return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description: description || "",
      discountType,
      discountValue: parseFloat(discountValue),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: parseInt(perUserLimit) || 1,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt || null,
      applicableFor: applicableFor || "all",
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

    const fields = ["description", "discountType", "discountValue", "maxDiscount",
                    "minOrderAmount", "usageLimit", "perUserLimit", "isActive", "expiresAt", "applicableFor"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) coupon[f] = req.body[f];
    });

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
