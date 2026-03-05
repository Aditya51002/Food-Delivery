const Restaurant = require("../models/Restaurant");
const FoodItem = require("../models/FoodItem");
const { cloudinary } = require("../config/cloudinary");

// ─── Create Restaurant ────────────────────────────────────────────────────────
const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, isActive, isOpen, cuisine, tags,
            deliveryTime, deliveryFee, minOrder, openingHours, phone } = req.body;
    const image = req.file ? req.file.path : "";

    const restaurant = await Restaurant.create({
      name,
      image,
      description: description || "",
      address,
      isActive: isActive !== undefined ? isActive : true,
      isOpen: isOpen !== undefined ? isOpen : true,
      cuisine: cuisine ? (Array.isArray(cuisine) ? cuisine : cuisine.split(",").map((c) => c.trim())) : [],
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
      deliveryTime: deliveryTime || "30-40 min",
      deliveryFee: parseFloat(deliveryFee) || 0,
      minOrder: parseFloat(minOrder) || 0,
      openingHours: openingHours || "9:00 AM - 11:00 PM",
      phone: phone || "",
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Restaurants ──────────────────────────────────────────────────────────
const getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, isOpen, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { cuisine: { $regex: search, $options: "i" } },
      ];
    }
    if (cuisine) filter.cuisine = { $in: [cuisine] };
    if (isOpen !== undefined) filter.isOpen = isOpen === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Restaurant.countDocuments(filter);
    const restaurants = await Restaurant.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ restaurants, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single Restaurant ────────────────────────────────────────────────────
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update Restaurant ────────────────────────────────────────────────────────
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const fields = ["name", "description", "address", "isActive", "isOpen",
                    "deliveryTime", "deliveryFee", "minOrder", "openingHours", "phone"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) restaurant[f] = req.body[f];
    });

    if (req.body.cuisine) {
      restaurant.cuisine = Array.isArray(req.body.cuisine)
        ? req.body.cuisine
        : req.body.cuisine.split(",").map((c) => c.trim());
    }
    if (req.body.tags) {
      restaurant.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(",").map((t) => t.trim());
    }

    if (req.file) {
      if (restaurant.image) {
        const publicId = restaurant.image.split("/").slice(-2).join("/").split(".")[0];
        try { await cloudinary.uploader.destroy(publicId); } catch (e) {}
      }
      restaurant.image = req.file.path;
    }

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Delete Restaurant ────────────────────────────────────────────────────────
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (restaurant.image) {
      const publicId = restaurant.image.split("/").slice(-2).join("/").split(".")[0];
      try { await cloudinary.uploader.destroy(publicId); } catch (e) {}
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createRestaurant, getRestaurants, getRestaurant, updateRestaurant, deleteRestaurant };

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
