// chicken-tender-backend/services/sessionService.js

import Session from "../models/Session.js";
import { generateSessionCode } from "../utils/sessionUtils.js";
import { fetchNearbyRestaurants } from "../controllers/restaurantController.js";

export const createSession = async (
  username,
  param1,
  param2,
  radiusInMeters
) => {
  let code;
  let isUnique = false;
  const expiresAt = new Date(new Date().getTime() + 60 * 60 * 1000); // 2 hours from now

  while (!isUnique) {
    code = generateSessionCode();
    const existingSession = await Session.findOne({ code });
    if (!existingSession) {
      isUnique = true;
    }
  }

  try {
    const restaurants = await fetchNearbyRestaurants(
      param1,
      param2,
      radiusInMeters
    );

    const newSession = await Session.create({
      code,
      users: [{ username }], // Changed to use an array of user objects
      sessionCreator: username, // Now using username as the session creator
      expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
      restaurants,
      lobbyOpen: true, // This flag should start as true
    });

    return newSession;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error; // Make sure to throw the error so it can be caught and handled by the caller
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
