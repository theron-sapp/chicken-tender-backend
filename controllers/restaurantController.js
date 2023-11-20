//chicken-tender-backend/controllers/restaurantController.js

import { fetchRestaurantsData } from "../services/restaurantService.js";

export const fetchNearbyRestaurants = async (req, res, next) => {
  try {
    const { latitude, longitude, radiusInMeters } = req.query;
    const restaurants = await fetchRestaurantsData(
      latitude,
      longitude,
      radiusInMeters
    );
    res.status(200).json(restaurants);
  } catch (error) {
    next(error); // Error handling is now centralized
  }
};
