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

// export const fetchNearbyRestaurants = async (req, res, next) => {
//   try {
//     // param1 and param2 could either be numbers or strings
//     const { param1, param2, radiusInMeters } = req.query;
//     if (isNaN(param1) && isNaN(param2)) {
//       let restaurants = await fetchRestaurantsDataWithCords(
//         param1,
//         param2,
//         radiusInMeters
//       );
//     } else {
//       let restaurants = await fetchRestaurantsDataNoCords(
//         param1,
//         param2,
//         radiusInMeters
//       );
//     }

//     res.status(200).json(restaurants);
//   } catch (error) {
//     next(error); // Error handling is now centralized
//   }
// };
