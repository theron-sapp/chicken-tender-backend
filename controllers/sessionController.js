//chicken-tender-backend/controllers/sessionController.js

import * as sessionService from "../services/sessionService.js";
import * as votingService from "../services/votingService.js";
import { updateFinishedVotingBoolean } from "../services/sessionService.js";
import Session from "../models/Session.js";
import { checkDailySessionLimit } from "../services/userService.js";
import { io } from "../server.js";
import { param } from "express-validator";

export const createSession = async (req, res, next) => {
  try {
    const { username, param1, param2, radiusInMeters, maxPriceLevel } =
      req.body;
    console.log(`Received params:`, {
      username,
      param1,
      param2,
      radiusInMeters,
      maxPriceLevel,
    }); // Log the parameters

    const newSession = await sessionService.createSession(
      username,
      param1,
      param2,
      radiusInMeters,
      maxPriceLevel
    );
    if (newSession.error) {
      return res.status(400).json({ message: newSession.error });
    }
    res.status(201).json(newSession);
  } catch (error) {
    if (
      error.message === "You've reached the daily limit for creating sessions."
    ) {
      return res.status(429).json({ message: error.message });
    }
    // next(error);
  }
};

export const joinSession = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { username } = req.body; // No longer userId

    const session = await sessionService.joinSession(code, username);

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

export const leaveSession = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { username } = req.body; // No longer userId

    const session = await sessionService.leaveSession(code, username);

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

export const closeSession = async (req, res, next) => {
  try {
    const { code } = req.params; // Get the code from the route parameter

    await sessionService.closeSession(code);
    res.status(200).json({ message: "Session closed for voting" });
  } catch (error) {
    if (error.message === "Session already closed.") {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const vote = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { place_id, vote } = req.body;
    const updatedSession = await votingService.recordVote(code, place_id, vote);
    res.status(200).json({ message: "Vote recorded", session: updatedSession });
    console.log("Vote recorded");
  } catch (error) {
    next(error);
  }
};

export const getSessionResults = async (req, res, next) => {
  try {
    const { code } = req.params;
    const session = await sessionService.getSessionDetails(code);

    if (session.winningRestaurant) {
      res.status(200).json({ winner: session.winningRestaurant });

      setTimeout(async () => {
        try {
          await Session.findOneAndDelete({ code });
        } catch (error) {
          console.log("Session not found or already deleted.");
        }
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    } else {
      res.status(200).json({ message: "Voting is not yet complete" });
    }
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { code } = req.params;
    const session = await sessionService.getSessionDetails(code);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { code, username } = req.params;
    const session = await Session.findOne({ code });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.sessionCreator !== username) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this session" });
    }

    await Session.findOneAndDelete({ code });
    res.status(200).json({ message: "Session deleted" });
  } catch (error) {
    console.error("Error deleting session:", error);
    next(error);
  }
};

async function checkAllUsersVoted(session) {
  try {
    console.log("Checking alluservoted");
    const allUsersVoted = session.users.every(
      (user) => user.finishedVoting === true
    );

    if (allUsersVoted && !session.votingCompleted) {
      session.votingCompleted = true;
      await votingService.tallyVotes(session);
      await session.save();

      // Emitting the 'voting complete' event
      // io.to(session.code).emit("voting complete");

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error in checkAllUsersVoted: ${error}`);
    return false;
  }
}

export { checkAllUsersVoted };

export const updateUserVotingStatus = async (req, res) => {
  const { code, username } = req.params; // Assuming you're using route parameters

  try {
    const updatedSession = await updateFinishedVotingBoolean(code, username);
    // io.to(code).emit("done voting", { code, username });
    checkAllUsersVoted(updatedSession);
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
