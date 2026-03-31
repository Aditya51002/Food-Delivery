const { body } = require("express-validator");
const mongoose = require("mongoose");

const createReviewValidators = [
  body("targetType")
    .notEmpty().withMessage("targetType is required")
    .isIn(["food", "restaurant"]).withMessage("targetType must be 'food' or 'restaurant'"),

  body("targetId")
    .notEmpty().withMessage("targetId is required")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("targetId must be a valid ID"),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Review title must be under 100 characters"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Review comment must be under 1000 characters"),
];

module.exports = { createReviewValidators };
