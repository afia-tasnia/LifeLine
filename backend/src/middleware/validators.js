import { body, validationResult } from "express-validator";

// ─── Helper: run validationResult and short-circuit if errors exist ────────────
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first error message to keep responses concise
    const firstError = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ message: firstError.msg });
  }
  next();
};

// ─── Register validation ───────────────────────────────────────────────────────
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

  body("bloodGroup")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
    .withMessage("Invalid blood group."),

  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number."),

  body("location")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Location must be 100 characters or fewer."),

  body("role")
    .optional()
    .isIn(["donor", "receiver", "admin"])
    .withMessage("Invalid role."),

  handleValidationErrors,
];

// ─── Create blood request validation ──────────────────────────────────────────
export const validateBloodRequest = [
  body("bloodGroup")
    .notEmpty().withMessage("Blood group is required.")
    .isIn(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
    .withMessage("Invalid blood group."),

  body("hospital")
    .trim()
    .notEmpty().withMessage("Hospital name is required.")
    .isLength({ min: 2, max: 120 }).withMessage("Hospital name must be between 2 and 120 characters."),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Location must be between 2 and 100 characters."),

  body("unitsNeeded")
    .notEmpty().withMessage("Units needed is required.")
    .isInt({ min: 1, max: 20 }).withMessage("Units needed must be a whole number between 1 and 20."),

  body("isEmergency")
    .optional()
    .isBoolean().withMessage("isEmergency must be a boolean."),

  handleValidationErrors,
];