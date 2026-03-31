const router = require("express").Router();
const { createReview, getReviews, deleteReview } = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/:targetType/:targetId", getReviews);

router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
