const Cart = require("../models/Cart");
const FoodItem = require("../models/FoodItem");

// @desc    Add item to cart (or update quantity)
// @route   POST /api/cart/add
// @access  User
const addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const userId = req.user._id;

    if (!foodId) {
      return res.status(400).json({ message: "Food ID is required" });
    }

    const food = await FoodItem.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQty = quantity !== undefined ? quantity : cart.items[existingItemIndex].quantity + 1;
      if (newQty <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = newQty;
      }
    } else {
      cart.items.push({ foodId, quantity: quantity || 1 });
    }

    // Recalculate total
    let total = 0;
    for (const item of cart.items) {
      const foodData = await FoodItem.findById(item.foodId);
      if (foodData) {
        total += foodData.price * item.quantity;
      }
    }
    cart.totalAmount = total;

    await cart.save();

    // Populate and return
    const populatedCart = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  User
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate("items.foodId");

    if (!cart) {
      cart = { userId: req.user._id, items: [], totalAmount: 0 };
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:foodId
// @access  User
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.foodId.toString() !== req.params.foodId
    );

    // Recalculate total
    let total = 0;
    for (const item of cart.items) {
      const foodData = await FoodItem.findById(item.foodId);
      if (foodData) {
        total += foodData.price * item.quantity;
      }
    }
    cart.totalAmount = total;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  User
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };
