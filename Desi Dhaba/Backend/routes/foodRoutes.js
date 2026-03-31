const router = require("express").Router();
const {
  getAllFoods, getCategories, createGlobalFoodItem,
  createFoodItem, getFoodsByRestaurant, updateFoodItem, deleteFoodItem,
} = require("../controllers/foodController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
const validate = require("../middleware/validate");
const { foodItemValidators } = require("../middleware/validators/foodValidators");

router.route("/").get(getAllFoods);
router.route("/categories").get(getCategories);

router
  .route("/create")
  .post(protect, adminOnly, upload.single("image"), foodItemValidators, validate, createGlobalFoodItem);

router
  .route("/item/:id")
  .put(protect, adminOnly, upload.single("image"), foodItemValidators, validate, updateFoodItem)
  .delete(protect, adminOnly, deleteFoodItem);

router
  .route("/:restaurantId")
  .get(getFoodsByRestaurant)
  .post(protect, adminOnly, upload.single("image"), foodItemValidators, validate, createFoodItem);

module.exports = router;
