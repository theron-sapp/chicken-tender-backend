import "dotenv/config";
import express, { json } from "express";
import { connect } from "mongoose";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js"; // Make sure to import the session routes

const app = express();
app.use(json()); // for parsing application/json

// Use the restaurant routes for requests to /api/restaurants
app.use("/api/restaurants", restaurantRoutes);

// Use the session routes for requests to /api/sessions
app.use("/api/sessions", sessionRoutes); // Include session routes

// Replace with your MongoDB URI
const mongoURI = process.env.MONGODB_URI;
connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
