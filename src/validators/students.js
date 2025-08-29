const { body } = require("express-validator");

const allowedSubjects = ["Math", "Science", "English", "History"];

const createOrUpdate = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name is required, min 2 chars"),
  // normalize email to reduce uniqueness issues due to case/whitespace
  body("email")
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail()
    .trim(),
  body("subject")
    .isIn(allowedSubjects)
    .withMessage("Subject must be one of " + allowedSubjects.join(", ")),
  body("grade")
    .isInt({ min: 0, max: 100 })
    .withMessage("Grade must be integer between 0 and 100"),
];

module.exports = { createOrUpdate, allowedSubjects };
