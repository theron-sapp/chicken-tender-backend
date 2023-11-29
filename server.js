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
dotenv.config();

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

io.on("connection", (socket) => {
  socket.on("join session", (sessionCode, username) => {
    // Join the socket room
    socket.join(sessionCode);
    // Additional logic
  });

  socket.on("start voting", async (sessionCode) => {
    console.log(`Start voting received for session code: ${sessionCode}`);

    try {
      const session = await Session.findOne({ code: sessionCode });
      if (session) {
        session.lobbyOpen = false; // Close the lobby for new joins
        session.votingCompleted = false; // Reset the flag
        await session.save();

        // Broadcast to all users in the session to start voting
        io.to(sessionCode).emit("voting started");
      }
    } catch (error) {
      console.error(`Error when starting voting: ${error}`);
    }
  });

  socket.on("done voting", async (sessionCode, username) => {
    try {
      const session = await Session.findOne({ code: sessionCode });
      if (!session) {
        console.error(`Session with code ${sessionCode} not found.`);
        return;
      }

      // Update the user's finishedVoting status
      const userIndex = session.users.findIndex((u) => u.username === username);
      if (userIndex !== -1) {
        session.users[userIndex].finishedVoting = true;
        await session.save();
      }

      // Check if all users are done voting
      await checkAllUsersVoted(session);
    } catch (error) {
      console.error(`Error in 'done voting' event: ${error}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Additional logic for disconnect
  });
});

// // Socket.io connection handler
// io.on("connection", (socket) => {
//   //console.log("a user connected");

//   // Handle joining a session
//   socket.on("join session", (sessionCode, username) => {
//     console.log(`User ${username} joined session: ${sessionCode}`);
//     socket.join(sessionCode);
//     // Notify others in the session
//     socket.to(sessionCode).emit("userJoined", username);
//   });

//   socket.on("start voting", async (sessionCode) => {
//     try {
//       const session = await Session.findOne({ code: sessionCode });
//       if (session) {
//         session.lobbyOpen = false; // Close the lobby for new joins
//         session.votingCompleted = false; // Reset the flag
//         await session.save();

//         // Broadcast to all users in the session to start voting
//         io.to(sessionCode).emit("voting started");
//       }
//     } catch (error) {
//       console.error(`Error when starting voting: ${error}`);
//     }
//   });

//   socket.on("done voting", async (sessionCode, username) => {
//     try {
//       const session = await Session.findOne({ code: sessionCode });
//       if (!session) {
//         console.error(`Session with code ${sessionCode} not found.`);
//         return;
//       }

//       const userIndex = session.users.findIndex((u) => u.username === username);
//       if (userIndex !== -1) {
//         session.users[userIndex].finishedVoting = true;
//         await session.save();
//         io.to(sessionCode).emit("user finished voting", { username });

//         // Call checkAllUsersVoted with just the session code
//         const results = await checkAllUsersVoted(session, io);
//         if (results) {
//           console.log(`Results: \n ${JSON.stringify(results)}`);
//           io.to(sessionCode).emit("results", JSON.stringify(results));
//         }
//       } else {
//         console.error(`User ${username} not found in session ${sessionCode}.`);
//       }
//     } catch (error) {
//       console.error(`Error when handling done voting: ${error}`);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });

// Use the error handler middleware last, after all routes
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io };
export default app;
