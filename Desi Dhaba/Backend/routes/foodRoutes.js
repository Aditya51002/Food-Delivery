const router = require("express").Router();
const {
  createFoodItem,
  getFoodsByRestaurant,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// Routes with restaurantId param (create + get by restaurant)
router
  .route("/:restaurantId")
  .get(getFoodsByRestaurant)
  .post(protect, adminOnly, upload.single("image"), createFoodItem);

// Routes with food item id (update + delete)
router
  .route("/item/:id")
  .put(protect, adminOnly, upload.single("image"), updateFoodItem)
  .delete(protect, adminOnly, deleteFoodItem);

module.exports = router;
