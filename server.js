// server.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Session from "./models/Session.js";

// Import middlewares
import { errorHandler } from "./middleware/errorHandler.js";

// Import rate limiter if you have one set up
import { createAccountLimiter } from "./middleware/rateLimit.js";

// Import routes
import restaurantRoutes from "./routes/restaurantRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { checkAllUsersVoted } from "./controllers/sessionController.js";

// Initialize environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Create the Express application
const app = express();
const server = http.createServer(app); // Wrap the Express app with the http server
const io = new Server(server); // Initialize socket.io with the http server

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse the body of the HTTP requests
app.use(express.json());

// Use the rate limiter middleware globally or on specific routes if needed
app.use(createAccountLimiter);

// Use the restaurant and session routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/sessions", sessionRoutes);

// Socket.io connection handler
io.on("connection", (socket) => {
  //console.log("a user connected");

  // Handle joining a session
  socket.on("join session", (sessionCode, userId) => {
    console.log(`User ${userId} joined session: ${sessionCode}`);
    socket.join(sessionCode);
    // Notify others in the session
    socket.to(sessionCode).emit("userJoined", userId);
  });

  socket.on("start voting", async (sessionCode) => {
    try {
      const session = await Session.findOne({ code: sessionCode });
      if (session) {
        session.lobbyOpen = false; // Close the lobby for new joins
        await session.save();

        // Broadcast to all users in the session to start voting
        io.to(sessionCode).emit("voting started");
      }
    } catch (error) {
      console.error(`Error when starting voting: ${error}`);
    }
  });

  // Handle closing a session
  socket.on("close session", (sessionCode) => {
    // You would also update the session's lobbyOpen status in the database here
    socket.to(sessionCode).emit("session closed");
  });

  // Inside the io.on("connection") callback
  socket.on("done voting", async ({ sessionCode, userId }) => {
    try {
      const session = await Session.findOne({ code: sessionCode });
      if (session) {
        const userIndex = session.userVotes.findIndex(
          (u) => u.userId === userId
        );
        if (userIndex !== -1) {
          session.userVotes[userIndex].hasVoted = true;
          console.log(
            `User ${userId} voting status: ${session.userVotes[userIndex].hasVoted}`
          );
        } else {
          // If the user hasn't been added to the userVotes array, add them
          session.userVotes.push({ userId, hasVoted: true });
          console.log(`User votes array: ${JSON.stringify(session.userVotes)}`);
        }
        await session.save();

        // Now call the checkAllUsersVoted function
        checkAllUsersVoted(session, io); // Pass the io object to the function
      }
    } catch (error) {
      console.error(`Error when updating vote status: ${error}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Use the error handler middleware last, after all routes
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io };
export default app;
