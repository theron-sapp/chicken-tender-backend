//chicken-tender-backend/controllers/restaurantController.js

import {
  fetchRestaurantsDataWithCords,
  fetchRestaurantsDataNoCords,
} from "../services/restaurantService.js";

// Helper function to check if the value can be treated as a float
function looksLikeCoordinate(value) {
  // Regular expression to check if a string is a valid floating point number
  // This is a simple regex and might need to be adjusted for comprehensive validation
  return /^-?\d+(\.\d+)?$/.test(value);
}

export const fetchNearbyRestaurants = async (
  param1,
  param2,
  radiusInMeters
) => {
  console.log(`Fetching restaurants with:`, { param1, param2, radiusInMeters }); // Log the parameters

  try {
    let restaurants;

    // Check if both param1 and param2 look like valid coordinates
    if (looksLikeCoordinate(param1) && looksLikeCoordinate(param2)) {
      // Parse the strings as floats
      const latitude = parseFloat(param1);
      const longitude = parseFloat(param2);

      // Call the function for coordinates
      restaurants = await fetchRestaurantsDataWithCords(
        latitude,
        longitude,
        radiusInMeters
      );
    } else {
      // Treat them as city and state strings
      restaurants = await fetchRestaurantsDataNoCords(
        param1,
        param2,
        radiusInMeters
      );
    }
    return restaurants; // Return the result directly
  } catch (error) {
    throw error; // Re-throw the error to be handled by the caller
  }
};
