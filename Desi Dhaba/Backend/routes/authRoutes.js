const router = require("express").Router();
const {
  register, login, refreshToken, logout,
  getMe, updateProfile, changePassword,
  addAddress, deleteAddress, getAllUsers,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  registerValidators,
  loginValidators,
  changePasswordValidators,
  addAddressValidators,
} = require("../middleware/validators/authValidators");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

router.post("/register", registerValidators, validate, register);
router.post("/login", loginValidators, validate, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePasswordValidators, validate, changePassword);
router.post("/addresses", protect, addAddressValidators, validate, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
