const router = require("express").Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router
  .route("/")
  .get(getRestaurants)
  .post(protect, adminOnly, upload.single("image"), createRestaurant);

router
  .route("/:id")
  .get(getRestaurant)
  .put(protect, adminOnly, upload.single("image"), updateRestaurant)
  .delete(protect, adminOnly, deleteRestaurant);

module.exports = router;
