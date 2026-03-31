const router = require("express").Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

router.get("/", getRestaurants);
router.get("/:id", getRestaurant);

router.post("/", protect, adminOnly, upload.single("image"), createRestaurant);
router.put("/:id", protect, adminOnly, upload.single("image"), updateRestaurant);
router.delete("/:id", protect, adminOnly, deleteRestaurant);

module.exports = router;
