// chicken-tender-backend/services/sessionService.js

import Session from "../models/Session.js";
import { generateSessionCode } from "../utils/sessionUtils.js";
import { fetchNearbyRestaurants } from "../controllers/restaurantController.js";

export const createSession = async (
  username,
  param1,
  param2,
  radiusInMeters,
  maxPriceLevel = 2,
  restaurantList = [],
  onlyList = false
) => {
  let restaurants = [];
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = generateSessionCode();
    const existingSession = await Session.findOne({ code });
    if (!existingSession) {
      isUnique = true;
    }
  }

  console.log(`Only List value: ${onlyList}`);

  try {
    if (onlyList !== "true" && onlyList !== true) {
      console.log("Fetching restaurants");
      restaurants = await fetchNearbyRestaurants(
        param1,
        param2,
        radiusInMeters,
        maxPriceLevel
      );
    }

    if (restaurantList && restaurantList.length > 0) {
      restaurants = [...restaurantList, ...restaurants];
    }

    console.log(`Final Restaurant List: \n${JSON.stringify(restaurants)}`);

    if (restaurants.length === 0) {
      return {
        error: "No restaurants available in the specified area at this time.",
      };
    }

    const newSession = await Session.create({
      code,
      users: [{ username }],
      sessionCreator: username,
      expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
      restaurants, // This should now be correctly structured
      lobbyOpen: true,
    });

    return newSession;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
};

export const joinSession = async (code, username) => {
  const session = await Session.findOne({ code });

  if (!session) {
    throw new Error("Session not found");
  }

  if (!session.lobbyOpen) {
    throw new Error("Lobby is closed for voting");
  }

  const userExists = session.users.some((user) => user.username === username);
  if (!userExists) {
    session.users.push({ username });
    await session.save();
  }

  return session;
};

export const leaveSession = async (code, username) => {
  const session = await Session.findOne({ code });
  if (!session) {
    throw new Error("Session not found");
  }

  const userExists = session.users.some((user) => user.username === username);
  if (userExists) {
    session.users = session.users.filter((user) => user.username !== username);
    await session.save();
  }

  return session;
};

export const getSessionDetails = async (code) => {
  const session = await Session.findOne({ code });
  if (!session) {
    throw new Error("Session not found");
  } else {
    return session;
  }
};

export const closeSession = async (code) => {
  const session = await Session.findOne({ code });

  if (!session) {
    throw new Error("Session not found");
  }

  if (!session.lobbyOpen) {
    throw new Error("Session already closed.");
  }

  session.lobbyOpen = false;

  await session.save();

  // startVotingTimer(code);  // IMPLEMENTED ON FRONTEND

  return session; // Return the closed session
};

export const updateFinishedVotingBoolean = async (code, username) => {
  const session = await Session.findOne({ code });

  if (!session) {
    throw new Error("Session not found");
  }

  // Find the user within the session
  const user = session.users.find((user) => user.username === username);

  if (!user) {
    throw new Error("User not found in session");
  }

  user.finishedVoting = true;

  await session.save();

  console.log("Finished voting value set to true");

  return session;
};

const VOTING_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const startVotingTimer = (sessionCode) => {
  setTimeout(async () => {
    const session = await findSessionByCode(sessionCode);
    if (!session.votingCompleted) {
      processVotes(session);
      session.votingCompleted = true;
      await session.save();
      io.to(sessionCode).emit("voting complete");
    }
  }, VOTING_DURATION);
};
