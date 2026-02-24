const FoodItem = require("../models/FoodItem");
const { cloudinary } = require("../config/cloudinary");

// @desc    Create food item for a restaurant
// @route   POST /api/foods/:restaurantId
// @access  Admin
const createFoodItem = async (req, res) => {
  try {
    const { name, price, category, isAvailable } = req.body;
    const image = req.file ? req.file.path : "";

    const foodItem = await FoodItem.create({
      restaurantId: req.params.restaurantId,
      name,
      image,
      price,
      category,
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

    const { name, price, category, isAvailable } = req.body;

    food.name = name || food.name;
    food.price = price !== undefined ? price : food.price;
    food.category = category || food.category;
    food.isAvailable = isAvailable !== undefined ? isAvailable : food.isAvailable;

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
  createFoodItem,
  getFoodsByRestaurant,
  updateFoodItem,
  deleteFoodItem,
};
