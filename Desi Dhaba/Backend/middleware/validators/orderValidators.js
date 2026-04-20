const { body } = require("express-validator");

const placeOrderValidators = [
  body("deliveryAddress")
    .trim()
    .notEmpty().withMessage("Delivery address is required")
    .isLength({ min: 10, max: 300 }).withMessage("Delivery address must be 10–300 characters"),

  body("paymentMethod")
    .optional()
    .isIn(["COD", "Online"]).withMessage("Payment method must be COD or Online"),

  body("orderNote")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Order note must be under 500 characters"),

  body("couponCode")
    .optional()
    .trim()
    .matches(/^[A-Z0-9\-_]{2,20}$/).withMessage("Invalid coupon format — use uppercase letters, numbers, hyphens, or underscores")
];

const cancelOrderValidators = [
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Cancellation reason must be under 300 characters"),
];

const updateStatusValidators = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"])
    .withMessage("Invalid order status"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Note must be under 300 characters"),
];

module.exports = { placeOrderValidators, cancelOrderValidators, updateStatusValidators };
