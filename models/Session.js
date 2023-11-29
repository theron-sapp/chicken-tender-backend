// Chicken-Tender-Backend/models/Session.js

import mongoose from "mongoose";

const userVoteSchema = new mongoose.Schema({
  username: { type: String, required: true },
  finishedVoting: { type: Boolean, default: false },
});

const sessionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  users: [
    {
      username: String,
      finishedVoting: { type: Boolean, default: false },
    },
  ], // Use the userVoteSchema for the users array

  votes: [{ yelpBusinessId: String, count: Number }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: "1h" } },
  lobbyOpen: { type: Boolean, required: true },
  sessionCreator: { type: String, required: true }, // Add this field
  restaurants: [
    {
      id: String, // Yelp ID of the restaurant
      name: String,
      image: String,
      address: String,
      rating: Number,
      votes: Number,
      cuisine: String,
      price: String,
      distance: Number,
      url: String,
      reviewCount: Number,
    },
  ],
  votingCompleted: { type: Boolean, default: false },
});

sessionSchema.index(
  { "sessionCreationAttempts.date": 1 },
  { expireAfterSeconds: 86400 }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
