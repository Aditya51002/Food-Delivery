const { body } = require("express-validator");

const registerValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),

  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit Indian phone number"),
];

const loginValidators = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

const changePasswordValidators = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
    .matches(/[A-Za-z]/).withMessage("New password must contain at least one letter")
    .matches(/[0-9]/).withMessage("New password must contain at least one number"),
];

const addAddressValidators = [
  body("address")
    .trim()
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 10, max: 300 }).withMessage("Address must be 10–300 characters"),

  body("label")
    .optional()
    .trim()
    .isIn(["Home", "Work", "Other"]).withMessage("Label must be Home, Work, or Other"),
];

module.exports = {
  registerValidators,
  loginValidators,
  changePasswordValidators,
  addAddressValidators,
};
