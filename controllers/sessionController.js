//chicken-tender-backend/controllers/sessionController.js

import * as sessionService from "../services/sessionService.js";
import * as votingService from "../services/votingService.js";
import { checkDailySessionLimit } from "../services/userService.js";
import { io } from "../server.js";
import { param } from "express-validator";

export const createSession = async (req, res, next) => {
  try {
    const { username, param1, param2, radiusInMeters } = req.body;
    console.log(`Received params:`, {
      username,
      param1,
      param2,
      radiusInMeters,
    }); // Log the parameters

    // Before creating a session, check if the user has reached the daily limit
    //await checkDailySessionLimit(userId);
    const newSession = await sessionService.createSession(
      username,
      param1,
      param2,
      radiusInMeters
    );
    res.status(201).json(newSession);
  } catch (error) {
    if (
      error.message === "You've reached the daily limit for creating sessions."
    ) {
      return res.status(429).json({ message: error.message });
    }
    next(error); // Other errors are handled by the centralized error middleware
  }
};

export const joinSession = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { username } = req.body; // No longer userId

    const session = await sessionService.joinSession(code, username);
    io.to(code).emit("user joined", { username }); // Send username instead of userId

    res.status(200).json({ message: "Joined session", session });
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
    next(error); // Other errors are handled by the centralized error middleware
  }
};

export const vote = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { yelpBusinessId, vote } = req.body;

    // Call the recordVote function from votingService
    const updatedSession = await votingService.recordVote(
      code,
      yelpBusinessId,
      vote
    );
    res.status(200).json({ message: "Vote recorded", session: updatedSession });
    console.log("Vote recorded");
  } catch (error) {
    next(error); // Error handling is now centralized
  }
};

export const getSessionResults = async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await votingService.tallyVotes(code);
    if (results.winningRestaurant) {
      res
        .status(200)
        .json({ winner: results.winningRestaurant, tally: results.tally });
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

async function checkAllUsersVoted(session, io) {
  // Check if every user in the session has `hasVoted` set to true
  const allDone = session.userVotes.every((u) => u.hasVoted);
  if (allDone) {
    // If all users have voted, emit an event to all clients
    io.to(session.code).emit("voting complete");
    // Optionally, calculate and emit the winning restaurant here
    const results = await votingService.tallyVotes(session.code);
    if (results.winningRestaurant) {
      io.to(session.code).emit("results", results);
    }
  }
}

export { checkAllUsersVoted };

export const updateHasVotedController = async (req, res) => {
  const { code, username } = req.params; // Assuming you're using route parameters

  try {
    // Call the service function to update the user's hasVoted status
    const updatedSession = await updateHasVoted(code, username);

    // Send back the updated session
    res.json(updatedSession);
  } catch (error) {
    // If there's an error, send back an error message
    res.status(400).json({ message: error.message });
  }
};
