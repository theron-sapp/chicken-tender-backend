// chicken-tender-backend/routes/sessionRoutes.js
import { Router } from "express";
import {
  createSession,
  joinSession,
  vote,
  getSessionResults,
  getSession,
  leaveSession,
  closeSession,
  updateUserVotingStatus,
  deleteSession,
} from "../controllers/sessionController.js";
import {
  validateCreateSession,
  validateJoinSession,
} from "../middleware/sessionValidator.js";
import { createAccountLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/", createSession);
router.post("/:code/join", joinSession);
router.delete("/:code/leave", leaveSession);
router.post("/:code/vote", vote);
router.patch("/:code/close", closeSession);
router.get("/:code/results", getSessionResults);
router.get("/:code/details", getSession);
router.put("/:code/user/:username/donevoting", updateUserVotingStatus);
router.delete("/:code/:username/delete", deleteSession);
router.post("/log-message", (req, res) => {
  const message = req.body.message;
  console.log(message); // Log the message to the console
  res.status(200).send("Message received and logged.");
});

export default router;
