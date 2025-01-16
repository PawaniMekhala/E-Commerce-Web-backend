const express = require("express");
const { check } = require("express-validator");
const { sendContactMessage } = require("../controllers/contact-controller");
const router = express.Router();

// route to handle contact form submission
router.post(
  "/contact",
  [
    check("contactEmail").isEmail().withMessage("Please enter a valid email"),
    check("contactMessage").not().isEmpty().withMessage("Message is required"),
  ],
  sendContactMessage
);

module.exports = router;
