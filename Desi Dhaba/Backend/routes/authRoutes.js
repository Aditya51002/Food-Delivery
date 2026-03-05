const router = require("express").Router();
const {
  register, login, getMe, updateProfile, changePassword, addAddress, deleteAddress, getAllUsers
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

// Admin
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
