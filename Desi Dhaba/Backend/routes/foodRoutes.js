const router = require("express").Router();
const {
  getAllFoods,
  getCategories,
  createFoodItem,
  getFoodsByRestaurant,
  updateFoodItem,
  deleteFoodItem,
  createGlobalFoodItem,
} = require("../controllers/foodController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

router.get("/", getAllFoods);
router.get("/categories", getCategories);
router.get("/restaurant/:restaurantId", getFoodsByRestaurant);

router.post("/", protect, adminOnly, upload.single("image"), createGlobalFoodItem);
router.post("/restaurant/:restaurantId", protect, adminOnly, upload.single("image"), createFoodItem);
router.put("/item/:id", protect, adminOnly, upload.single("image"), updateFoodItem);
router.delete("/item/:id", protect, adminOnly, deleteFoodItem);

module.exports = router;
