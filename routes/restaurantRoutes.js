// ./routes/restaurantRoutes.js
import { Router } from "express";
import { fetchNearbyRestaurants } from "../controllers/restaurantController.js";

const router = Router();

router.get("/nearby", fetchNearbyRestaurants);

export default router;
