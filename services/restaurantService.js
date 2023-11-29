// ./services/restaurantService.js

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const YELP_API_KEY = process.env.YELP_API_KEY; // Assume this util gets the API keys and other constants.

export async function fetchRestaurantsDataNoCords(city, state, radiusInMeters) {
  // Construct the Yelp API endpoint with the query parameters
  const url = `https://api.yelp.com/v3/businesses/search?location=${city}%20${state}&radius=${radiusInMeters}&sort_by=best_match&limit=2`;

  try {
    // Log the request details for debugging
    console.log(`Requesting Yelp API with URL: ${url}`);
    console.log(`API KEY: ${process.env.YELP_API_KEY}`); // Should output your actual Yelp API key

    // Make the API request
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    });

    // Check if the response was successful
    // In your restaurantService.js
    if (!response.ok) {
      const errorDetail = `Yelp API responded with status: ${response.status} ${response.statusText}`;
      console.error(errorDetail);
      //console.log(errorDetail);
      throw new Error(
        `Failed to fetch restaurants with api call ${url} - ${errorDetail}`
      );
    }

    // Parse the response body
    const data = await response.json();

    // Return the formatted restaurant data
    return data.businesses.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image_url,
      address: restaurant.location.address1,
      rating: restaurant.rating,
      categories: restaurant.categories
        .map((category) => category.title)
        .join(", "),
      price: restaurant.price,
      distance: restaurant.distance,
      url: restaurant.url,
      // Add other details from Yelp response you want to use
    }));
  } catch (error) {
    // Log the error along with the request that caused it
    console.error(`Error fetching data from Yelp API with URL: ${url}`);
    console.error(`Error message: ${error.message}`);
    // You might want to log the error stack if it's an operational error
    console.error(`Error stack: ${error.stack}`);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
// Other restaurant related logic...
export async function fetchRestaurantsDataWithCords(
  latitude,
  longitude,
  radiusInMeters
) {
  // Construct the Yelp API endpoint with the query parameters
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=restaurant&radius=${radiusInMeters}&categories=&sort_by=best_match&limit=2`;

  try {
    // Log the request details for debugging
    console.log(`Requesting Yelp API with URL: ${url}`);
    console.log(`API KEY: ${process.env.YELP_API_KEY}`); // Should output your actual Yelp API key

    // Make the API request
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    });

    // Check if the response was successful
    // In your restaurantService.js
    if (!response.ok) {
      const errorDetail = `Yelp API responded with status: ${response.status} ${response.statusText}`;
      console.error(errorDetail);
      //console.log(errorDetail);
      throw new Error(
        `Failed to fetch restaurants with api call ${url} - ${errorDetail}`
      );
    }

    // Parse the response body
    const data = await response.json();

    // Return the formatted restaurant data
    return data.businesses.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image_url,
      address: restaurant.location.address1,
      rating: restaurant.rating,
      categories: restaurant.categories
        .map((category) => category.title)
        .join(", "),
      price: restaurant.price,
      distance: restaurant.distance,
      url: restaurant.url,
      // Add other details from Yelp response you want to use
    }));
  } catch (error) {
    // Log the error along with the request that caused it
    console.error(`Error fetching data from Yelp API with URL: ${url}`);
    console.error(`Error message: ${error.message}`);
    // You might want to log the error stack if it's an operational error
    console.error(`Error stack: ${error.stack}`);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
