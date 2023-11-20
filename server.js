// server.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import middlewares
import { errorHandler } from "./middleware/errorHandler.js";

// Import rate limiter if you have one set up
import { createAccountLimiter } from "./middleware/rateLimit.js";

// Import routes
import restaurantRoutes from "./routes/restaurantRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

// Initialize environment variables
dotenv.config();

// Create the Express application
const app = express();

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

// Use the error handler middleware last, after all routes
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the app for testing purposes
export default app;
