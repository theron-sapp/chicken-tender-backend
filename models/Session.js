//  ChickenTender-Backend/models/Session.js

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  users: [String], // Array of user identifiers
  votes: [{ yelpBusinessId: String, count: Number }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  userStatuses: [{ userId: String, hasVoted: Boolean }],
});

sessionSchema.index(
  { "sessionCreationAttempts.date": 1 },
  { expireAfterSeconds: 86400 }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
