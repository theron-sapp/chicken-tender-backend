//  ChickenTender-Backend/routes/sessionRoutes.js

import { Router } from "express";
import { body, validationResult } from "express-validator";
import {
  checkDailySessionLimit,
  createSession,
  joinSession,
  vote,
  getSessionResults,
} from "../controllers/sessionController.js";
const router = Router();

// Validation rules
const sessionValidationRules = [
  body("userId").notEmpty().withMessage("userId is required"),
  // Add other validation rules here
];

// Middleware to check for validation errors
const validateSession = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/",
  sessionValidationRules,
  validateSession,
  checkDailySessionLimit,
  createSession
);
router.post("/:code/join", joinSession);
router.post("/:code/vote", vote);
router.get("/:code/results", getSessionResults);

export default router;
