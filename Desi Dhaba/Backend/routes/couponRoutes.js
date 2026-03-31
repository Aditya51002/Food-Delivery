const router = require("express").Router();
const { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require("../controllers/couponController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/validate", protect, validateCoupon);

router.get("/", protect, adminOnly, getAllCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

module.exports = router;
