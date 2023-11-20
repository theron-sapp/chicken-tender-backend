// ./services/userService.js

import User from "../models/User.js";
console.log(User);
// This utility function checks if the provided date is today
const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
  );
};

export const createUserIfNotExists = async (userId) => {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId, sessionCreationAttempts: [] });
  }
  return user;
};

export const checkDailySessionLimit = async (userId) => {
  const user = await createUserIfNotExists(userId);

  // Filter attempts for the current day
  const attemptsToday = user.sessionCreationAttempts.filter((attempt) =>
    isToday(attempt.date)
  );

  if (attemptsToday.length >= 10) {
    throw new Error("You've reached the daily limit for creating sessions.");
  }

  // Record a new attempt and save the user
  user.sessionCreationAttempts.push({ date: new Date() });
  await user.save();

  return user; // return the user with the updated attempts
};

// Add other user related logic and functions as needed...
