import { Router } from "express";
import { fetchNearbyRestaurants } from "../controllers/restaurantController.js";

const router = Router();

// Updated to use query parameters for flexibility
router.get("/nearby", fetchNearbyRestaurants);

export default router;
