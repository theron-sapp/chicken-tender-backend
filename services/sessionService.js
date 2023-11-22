// ./services/sessionService.js

import Session from "../models/Session.js";
import { generateSessionCode } from "../utils/sessionUtils.js";
import User from "../models/User.js";
import { fetchNearbyRestaurants } from "../controllers/restaurantController.js";

export const createSession = async (userId, param1, param2, radiusInMeters) => {
  const today = new Date().setHours(0, 0, 0, 0);
  let user = await User.findOne({ userId });

  if (!user) {
    user = await User.create({ userId, sessionCreationAttempts: [] });
  }

  const attemptsToday = user.sessionCreationAttempts.filter((attempt) => {
    return new Date(attempt.date).setHours(0, 0, 0, 0) === today;
  });

  if (attemptsToday.length >= 10) {
    throw new Error("Daily session creation limit reached.");
  }
  user.sessionCreationAttempts.push({ date: new Date() });
  await user.save();

  let code;
  let isUnique = false;
  const expiresAt = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

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
      users: [userId],
      expiresAt,
      restaurants, // This assumes restaurants is an array of restaurant objects
    });

    return newSession;
  } catch (error) {
    console.log(`Error: ${error}`);
  }
  // const restaurants = await fetchNearbyRestaurants(
  //   param1,
  //   param2,
  //   radiusInMeters
  // );

  // const newSession = await Session.create({
  //   code,
  //   users: [userId],
  //   expiresAt,
  //   restaurants, // This assumes restaurants is an array of restaurant objects
  // });

  // return newSession;
};

export const joinSession = async (code, userId) => {
  const session = await Session.findOne({ code });

  if (!session) {
    throw new Error("Session not found");
  }

  if (!session.users.includes(userId) && session.lobbyOpen.valueOf(true)) {
    session.users.push(userId);
    await session.save();
  } else if (session.lobbyOpen.valueOf(false)) {
    throw new Error("Lobby no longer open");
  }

  return session; // Return the updated session
};

export const getSessionDetails = async (code) => {
  const session = await Session.findOne({ code });
  if (!session) {
    throw new Error("Session not found");
  } else {
    return session;
  }
};
