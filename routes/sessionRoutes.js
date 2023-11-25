// chicken-tender-backend/routes/sessionRoutes.js
import { Router } from "express";
import {
  createSession,
  joinSession,
  vote,
  getSessionResults,
  getSession,
  closeSession,
  updateHasVotedController,
} from "../controllers/sessionController.js";
import {
  validateCreateSession,
  validateJoinSession,
} from "../middleware/sessionValidator.js";
import { createAccountLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/", createSession);
router.post("/:code/join", joinSession);
router.post("/:code/vote", vote);
router.patch("/:code/close", closeSession);
router.get("/:code/results", getSessionResults);
router.get("/:code/details", getSession);
router.put(
  "/session/:code/user/:username/donevoting",
  updateHasVotedController
);

export default router;
