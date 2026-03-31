const { body } = require("express-validator");

const foodItemValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Food item name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0.01 }).withMessage("Price must be greater than 0"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required")
    .isLength({ max: 50 }).withMessage("Category must be under 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must be under 500 characters"),

  body("originalPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage("Original price must be a non-negative number"),

  body("isVeg")
    .optional()
    .isBoolean().withMessage("isVeg must be a boolean"),

  body("isAvailable")
    .optional()
    .isBoolean().withMessage("isAvailable must be a boolean"),

  body("isFeatured")
    .optional()
    .isBoolean().withMessage("isFeatured must be a boolean"),

  body("isBestSeller")
    .optional()
    .isBoolean().withMessage("isBestSeller must be a boolean"),

  body("spicyLevel")
    .optional()
    .isIn(["mild", "medium", "hot", "extra-hot"]).withMessage("Invalid spicy level"),

  body("calories")
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage("Calories must be a non-negative integer"),

  body("preparationTime")
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage("Preparation time must be under 30 characters"),
];

module.exports = { foodItemValidators };
