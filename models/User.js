//  ChickenTender-Backend/models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  sessionCreationAttempts: [
    {
      date: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
