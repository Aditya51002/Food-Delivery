const FoodItem = require("../models/FoodItem");
const { cloudinary } = require("../config/cloudinary");

const getCloudinaryPublicId = (url) => {
  if (!url || !url.includes("cloudinary")) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename.split(".")[0]}`;
};

const safeDestroyImage = async (url) => {
  const publicId = getCloudinaryPublicId(url);
  if (publicId) {
    try { await cloudinary.uploader.destroy(publicId); } catch { }
  }
};

const getAllFoods = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== "All") filter.category = category;
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    const foods = await FoodItem.find(filter).sort({ category: 1, name: 1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await FoodItem.distinct("category", { isAvailable: true });
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createGlobalFoodItem = async (req, res) => {
  try {
    const {
      name, price, category, isAvailable, description,
      isVeg, spicyLevel, preparationTime, calories, originalPrice,
      isFeatured, isBestSeller, tags,
    } = req.body;
    const image = req.file ? req.file.path : "";

    const foodItem = await FoodItem.create({
      name,
      description: description || "",
      image,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category,
      isAvailable: isAvailable !== undefined ? (isAvailable === "true" || isAvailable === true) : true,
      isVeg: isVeg !== undefined ? (isVeg === "true" || isVeg === true) : true,
      spicyLevel: spicyLevel || "mild",
      preparationTime: preparationTime || "15-20 min",
      calories: calories ? parseInt(calories) : null,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isBestSeller: isBestSeller === "true" || isBestSeller === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
    });

    res.status(201).json(foodItem);
  } catch (error) {
    if (req.file?.path) await safeDestroyImage(req.file.path);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createFoodItem = async (req, res) => {
  try {
    const {
      name, price, category, isAvailable, description,
      isVeg, spicyLevel, preparationTime, calories, originalPrice,
      isFeatured, isBestSeller, tags,
    } = req.body;
    const image = req.file ? req.file.path : "";

    const foodItem = await FoodItem.create({
      restaurantId: req.params.restaurantId,
      name,
      description: description || "",
      image,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category,
      isAvailable: isAvailable !== undefined ? (isAvailable === "true" || isAvailable === true) : true,
      isVeg: isVeg !== undefined ? (isVeg === "true" || isVeg === true) : true,
      spicyLevel: spicyLevel || "mild",
      preparationTime: preparationTime || "15-20 min",
      calories: calories ? parseInt(calories) : null,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isBestSeller: isBestSeller === "true" || isBestSeller === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
    });

    res.status(201).json(foodItem);
  } catch (error) {
    if (req.file?.path) await safeDestroyImage(req.file.path);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFoodsByRestaurant = async (req, res) => {
  try {
    const foods = await FoodItem.find({ restaurantId: req.params.restaurantId })
      .sort({ isAvailable: -1, category: 1, name: 1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateFoodItem = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const {
      name, price, category, isAvailable, description,
      isVeg, spicyLevel, preparationTime, calories, originalPrice,
      isFeatured, isBestSeller, tags,
    } = req.body;

    if (name !== undefined) food.name = name;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = parseFloat(price);
    if (originalPrice !== undefined) food.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (category !== undefined) food.category = category;
    if (preparationTime !== undefined) food.preparationTime = preparationTime;
    if (calories !== undefined) food.calories = calories ? parseInt(calories) : null;

    if (isAvailable !== undefined) food.isAvailable = isAvailable === "true" || isAvailable === true;
    if (isVeg !== undefined) food.isVeg = isVeg === "true" || isVeg === true;
    if (isFeatured !== undefined) food.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isBestSeller !== undefined) food.isBestSeller = isBestSeller === "true" || isBestSeller === true;

    if (spicyLevel !== undefined) food.spicyLevel = spicyLevel;
    if (tags !== undefined) {
      food.tags = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim());
    }

    if (req.file) {
      await safeDestroyImage(food.image);
      food.image = req.file.path;
    }

    const updated = await food.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteFoodItem = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    await safeDestroyImage(food.image);
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
