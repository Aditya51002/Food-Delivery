const express = require("express");
const router = express.Router();
const { createReview, getReviews, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createReviewValidators } = require("../middleware/validators/reviewValidators");

router.post("/", protect, createReviewValidators, validate, createReview);
router.get("/:targetType/:targetId", getReviews);
router.delete("/:id", protect, deleteReview);

module.exports = router;
