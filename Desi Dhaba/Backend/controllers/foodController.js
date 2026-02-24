const FoodItem = require("../models/FoodItem");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get ALL food items (with optional category filter)
// @route   GET /api/foods
// @access  Public
const getAllFoods = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isAvailable: true };
    if (category && category !== "All") filter.category = category;
    const foods = await FoodItem.find(filter).sort({ category: 1, name: 1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get distinct food categories
// @route   GET /api/foods/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await FoodItem.distinct("category", { isAvailable: true });
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create food item globally (no restaurantId needed)
// @route   POST /api/foods/create
// @access  Admin
const createGlobalFoodItem = async (req, res) => {
  try {
    const { name, price, category, isAvailable, rating, description } = req.body;
    const image = req.file ? req.file.path : "";

    const foodItem = await FoodItem.create({
      name,
      description: description || "",
      image,
      price: parseFloat(price),
      category,
      rating: rating !== undefined ? parseFloat(rating) : 4.0,
      isAvailable: isAvailable !== undefined ? isAvailable === "true" || isAvailable === true : true,
    });

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create food item for a restaurant
// @route   POST /api/foods/:restaurantId
// @access  Admin
const createFoodItem = async (req, res) => {
  try {
    const { name, price, category, isAvailable, rating, description } = req.body;
    const image = req.file ? req.file.path : "";

    const foodItem = await FoodItem.create({
      restaurantId: req.params.restaurantId,
      name,
      description: description || "",
      image,
      price,
      category,
      rating: rating !== undefined ? parseFloat(rating) : 4.0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all food items for a restaurant
// @route   GET /api/foods/:restaurantId
// @access  Public
const getFoodsByRestaurant = async (req, res) => {
  try {
    const foods = await FoodItem.find({ restaurantId: req.params.restaurantId }).sort({
      category: 1,
      name: 1,
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Admin
const updateFoodItem = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const { name, price, category, isAvailable, rating, description } = req.body;

    food.name = name || food.name;
    food.description = description !== undefined ? description : food.description;
    food.price = price !== undefined ? parseFloat(price) : food.price;
    food.category = category || food.category;
    food.rating = rating !== undefined ? parseFloat(rating) : food.rating;
    food.isAvailable = isAvailable !== undefined
      ? (isAvailable === "true" || isAvailable === true)
      : food.isAvailable;

    if (req.file) {
      if (food.image) {
        const publicId = food.image.split("/").slice(-2).join("/").split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {}
      }
      food.image = req.file.path;
    }

    const updated = await food.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Admin
const deleteFoodItem = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    if (food.image) {
      const publicId = food.image.split("/").slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {}
    }

    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllFoods,
  getCategories,
  createGlobalFoodItem,
  createFoodItem,
  getFoodsByRestaurant,
  updateFoodItem,
  deleteFoodItem,
};
