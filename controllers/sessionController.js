// ChickenTender-Backend/controllers/sessionController.js

import Session from "../models/Session.js";
import User from "../models/User.js";
import { generateSessionCode } from "../utils/sessionUtils.js";

export const checkDailySessionLimit = async (req, res, next) => {
  const { userId } = req.body;
  const today = new Date().setHours(0, 0, 0, 0);

  const user = await User.findOne({ userId });
  if (!user) {
    // If it's a new user ID for the day, create a new user record
    await User.create({
      userId,
      sessionCreationAttempts: [{ date: new Date() }],
    });
    return next();
  }

  // Filter attempts for the current day
  const attemptsToday = user.sessionCreationAttempts.filter((attempt) => {
    return new Date(attempt.date).setHours(0, 0, 0, 0) === today;
  });

  if (attemptsToday.length >= 3) {
    return res.status(429).json({
      message: "You've reached the daily limit for creating sessions.",
    });
  }

  // Record a new attempt and proceed
  user.sessionCreationAttempts.push({ date: new Date() });
  await user.save();
  next();
};

export const createSession = async (req, res) => {
  const { userId } = req.body;
  const today = new Date().setHours(0, 0, 0, 0);

  try {
    // Find the user or create a new record if it doesn't exist
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, sessionCreationAttempts: [] });
    }

    // Filter attempts for the current day and check the limit
    const attemptsToday = user.sessionCreationAttempts.filter((attempt) => {
      return new Date(attempt.date).setHours(0, 0, 0, 0) === today;
    });

    if (attemptsToday.length >= 3) {
      return res
        .status(429)
        .json({ message: "Daily session creation limit reached." });
    }

    // Record the new session attempt
    user.sessionCreationAttempts.push({ date: new Date() });
    await user.save();

    // Proceed to create a new session
    let code;
    let isUnique = false;
    const expiresAt = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // Session expires in 2 hours

    while (!isUnique) {
      code = generateSessionCode();
      const existingSession = await Session.findOne({ code });
      if (!existingSession) {
        isUnique = true;
      }
    }

    // The user who creates the session is automatically added to the users array
    const newSession = await Session.create({
      code,
      expiresAt,
      users: [userId], // Add the creator's userId to the session
    });

    res.status(201).json(newSession);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    } else {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
};

export const joinSession = async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;

    const session = await Session.findOne({ code });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.users.includes(userId)) {
      session.users.push(userId);
      await session.save();
    }

    res.status(200).json({ message: "Joined session", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error joining session", error });
  }
};

export const vote = async (req, res) => {
  try {
    const { code } = req.params;
    const { userId, yelpBusinessId, vote } = req.body; // `vote` is either 'like' or 'dislike'

    const session = await Session.findOne({ code });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // If the user votes 'like', find the vote object or create a new one, then increment the count.
    if (vote === "like") {
      let voteEntry = session.votes.find(
        (v) => v.yelpBusinessId === yelpBusinessId
      );
      if (voteEntry) {
        voteEntry.count++; // Increment existing count
      } else {
        // Create a new vote entry for the restaurant
        session.votes.push({ yelpBusinessId, count: 1 });
      }
    }
    // No action needed if the user votes 'dislike'

    await session.save();
    res.status(200).json({ message: "Vote recorded", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error recording vote", error });
  }
};

export const getSessionResults = async (req, res) => {
  try {
    const { code } = req.params;

    // Find the session.
    const session = await Session.findOne({ code });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if all users have finished voting.
    const allHaveVoted = session.userStatuses.every((user) => user.hasVoted);
    if (!allHaveVoted) {
      return res.status(200).json({ message: "Voting is not yet complete" });
    }

    // If all users have voted, tally the votes.
    const tally = session.votes.reduce((acc, vote) => {
      if (!acc[vote.yelpBusinessId]) {
        acc[vote.yelpBusinessId] = 0;
      }
      acc[vote.yelpBusinessId] += vote.count;
      return acc;
    }, {});

    // Find the restaurant with the most votes.
    let maxVotes = 0;
    let winningRestaurant = null;
    for (const [key, value] of Object.entries(tally)) {
      if (value > maxVotes) {
        maxVotes = value;
        winningRestaurant = key;
      }
    }

    // Respond with the winning restaurant.
    res.status(200).json({ winner: winningRestaurant, tally });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting session results", error });
  }
};
