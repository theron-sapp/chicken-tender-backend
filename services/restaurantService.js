// ./services/restaurantService.js

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const YELP_API_KEY = process.env.YELP_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function fetchRestaurantsDataNoCords(city, state, radiusInMeters) {
  // Construct the Yelp API endpoint with the query parameters
  const url = `https://api.yelp.com/v3/businesses/search?location=${city}%20${state}&radius=${radiusInMeters}&sort_by=best_match&limit=10`;

  try {
    // Log the request details for debugging
    console.log(`Requesting Yelp API with URL: ${url}`);
    // console.log(`API KEY: ${process.env.YELP_API_KEY}`);

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
export async function fetchRestaurantsDataWithCordsYelp(
  latitude,
  longitude,
  radiusInMeters
) {
  // Construct the Yelp API endpoint with the query parameters
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=restaurant&radius=${radiusInMeters}&categories=&sort_by=best_match&limit=10`;

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

export async function fetchRestaurantsDataWithCordsGoogle(
  latitude,
  longitude,
  radiusInMeters,
  maxPriceLevel = 2
) {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusInMeters}&type=restaurant&keyword=dining&opennow=true&maxprice=${maxPriceLevel}&key=${GOOGLE_API_KEY}`;

  try {
    console.log(`Fetching restaurants: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status === "ZERO_RESULTS") {
      throw new Error("No restaurants found in the specified area.");
    }

    return data.results.map((restaurant) => {
      // Construct image URL using the photo_reference
      const photoReference = restaurant.photos?.[0]?.photo_reference;
      const imageUrl = photoReference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`
        : ""; // Default to an empty string if no photo_reference

      return {
        id: restaurant.place_id,
        name: restaurant.name,
        image: imageUrl,
        address: restaurant.vicinity,
        rating: restaurant.rating,
        votes: 0,
        price: restaurant.price_level?.toString() || "",
        url: `https://www.google.com/maps/place/?q=place_id:${restaurant.place_id}`,
      };
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
}
