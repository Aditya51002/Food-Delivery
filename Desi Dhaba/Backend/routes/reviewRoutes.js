const express = require("express");
const router = express.Router();
const { createReview, getReviews, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/:targetType/:targetId", getReviews);
router.delete("/:id", protect, deleteReview);

module.exports = router;
