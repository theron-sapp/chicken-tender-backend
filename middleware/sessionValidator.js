// ./middleware/sessionValidator.js
import { body, validationResult } from "express-validator";

// Middleware for creating a new session
export const validateCreateSession = [
  body("userId").trim().notEmpty().withMessage("userId is required"),
  // body("latitude")
  //   .isFloat({ min: -90, max: 90 })
  //   .withMessage("Valid latitude is required"),
  // body("longitude")
  //   .isFloat({ min: -180, max: 180 })
  //   .withMessage("Valid longitude is required"),
  body("radiusInMeters")
    .isInt({ min: 1 })
    .withMessage("Valid radius in meters is required"),
  // Add any other fields you need to validate here
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware for joining a session
export const validateJoinSession = [
  body("userId").trim().notEmpty().withMessage("userId is required"),
  // Add any other fields you need to validate here
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
