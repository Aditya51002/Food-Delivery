const Restaurant = require("../models/Restaurant");
const { cloudinary } = require("../config/cloudinary");

const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, isActive } = req.body;
    const image = req.file ? req.file.path : "";

    const restaurant = await Restaurant.create({
      name,
      image,
      description,
      address,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { name, description, address, isActive } = req.body;

    restaurant.name = name || restaurant.name;
    restaurant.description = description !== undefined ? description : restaurant.description;
    restaurant.address = address || restaurant.address;
    restaurant.isActive = isActive !== undefined ? isActive : restaurant.isActive;

    if (req.file) {
      if (restaurant.image) {
        const publicId = restaurant.image.split("/").slice(-2).join("/").split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
        }
      }
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
    if (restaurant.image) {
      const publicId = restaurant.image.split("/").slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
      }
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted successfully" });
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
