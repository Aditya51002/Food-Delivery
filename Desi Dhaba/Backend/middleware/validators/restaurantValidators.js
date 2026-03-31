const { body } = require("express-validator");

const restaurantValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Restaurant name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 10, max: 300 }).withMessage("Address must be 10–300 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description must be under 1000 characters"),

  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit phone number"),

  body("deliveryTime")
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage("Delivery time must be under 30 characters"),

  body("deliveryFee")
    .optional()
    .isFloat({ min: 0 }).withMessage("Delivery fee must be a non-negative number"),

  body("minOrder")
    .optional()
    .isFloat({ min: 0 }).withMessage("Minimum order must be a non-negative number"),

  body("isOpen")
    .optional()
    .isBoolean().withMessage("isOpen must be a boolean"),
];

module.exports = { restaurantValidators };
