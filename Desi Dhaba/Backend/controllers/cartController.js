const Cart = require("../models/Cart");
const FoodItem = require("../models/FoodItem");
const mongoose = require("mongoose");

const recalcCartTotal = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) return 0;

  const foodIds = cartItems.map((i) => i.foodId);
  const prices = await FoodItem.find({ _id: { $in: foodIds } }, { price: 1 }).lean();
  const priceMap = {};
  prices.forEach((p) => { priceMap[p._id.toString()] = p.price; });

  return cartItems.reduce((sum, item) => {
    const price = priceMap[item.foodId.toString()] || 0;
    return sum + price * item.quantity;
  }, 0);
};

const addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const userId = req.user._id;

    if (!foodId || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ message: "Valid food ID is required" });
    }

    const food = await FoodItem.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }
    if (!food.isAvailable) {
      return res.status(400).json({ message: "This item is currently unavailable" });
    }

    const requestedQty = quantity !== undefined ? parseInt(quantity) : undefined;
    if (requestedQty !== undefined && (isNaN(requestedQty) || requestedQty < 0)) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId.toString()
    );

    if (existingIndex > -1) {
      const newQty = requestedQty !== undefined
        ? requestedQty
        : cart.items[existingIndex].quantity + 1;

      if (newQty <= 0) {
        cart.items.splice(existingIndex, 1);
      } else if (newQty > 50) {
        return res.status(400).json({ message: "Maximum quantity per item is 50" });
      } else {
        cart.items[existingIndex].quantity = newQty;
      }
    } else {
      const initialQty = requestedQty !== undefined ? requestedQty : 1;
      if (initialQty <= 0) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      cart.items.push({ foodId, quantity: initialQty });
    }

    cart.totalAmount = await recalcCartTotal(cart.items);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate("items.foodId");

    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    const validItems = cart.items.filter((item) => item.foodId !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems.map((item) => ({
        foodId: item.foodId._id,
        quantity: item.quantity,
      }));
      cart.totalAmount = await recalcCartTotal(cart.items);
      await cart.save();
      cart = await Cart.findById(cart._id).populate("items.foodId");
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.foodId.toString() !== req.params.foodId
    );

    cart.totalAmount = await recalcCartTotal(cart.items);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    res.json({ message: "Cart cleared", items: [], totalAmount: 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };
