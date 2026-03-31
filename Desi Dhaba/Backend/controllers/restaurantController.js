const Restaurant = require("../models/Restaurant");
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
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      isOpen: isOpen !== undefined ? (isOpen === "true" || isOpen === true) : true,
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
    if (req.file?.path) await safeDestroyImage(req.file.path);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, isOpen, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { cuisine: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }
    if (cuisine) filter.cuisine = { $in: [cuisine] };
    if (isOpen !== undefined) filter.isOpen = isOpen === "true";

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Restaurant.countDocuments(filter);
    const restaurants = await Restaurant.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    res.json({ restaurants, total, page: parsedPage, pages: Math.ceil(total / parsedLimit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const stringFields = ["name", "description", "address", "deliveryTime", "openingHours", "phone"];
    stringFields.forEach((f) => {
      if (req.body[f] !== undefined) restaurant[f] = req.body[f];
    });

    const numberFields = ["deliveryFee", "minOrder"];
    numberFields.forEach((f) => {
      if (req.body[f] !== undefined) restaurant[f] = parseFloat(req.body[f]);
    });

    if (req.body.isActive !== undefined) {
      restaurant.isActive = req.body.isActive === "true" || req.body.isActive === true;
    }
    if (req.body.isOpen !== undefined) {
      restaurant.isOpen = req.body.isOpen === "true" || req.body.isOpen === true;
    }

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
      await safeDestroyImage(restaurant.image);
      restaurant.image = req.file.path;
    }

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await safeDestroyImage(restaurant.image);
    await FoodItem.deleteMany({ restaurantId: restaurant._id });
    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: "Restaurant and its menu items deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
