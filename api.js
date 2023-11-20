// api.js

import { YELP_API_KEY } from "@env"; // Make sure to add your Yelp API Key to your environment variables
import { jsonData } from "../data";

export const fetchNearbyRestaurantsDev = () => {
  return jsonData.businesses.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    image: restaurant.image_url,
    description: restaurant.location.address1,
    rating: restaurant.rating,
    cuisine: restaurant.categories.map((category) => category.title).join(", "),
    address: restaurant.location.address1,
    votes: 0,
    price: restaurant.price ?? "", // Fallback to empty string if undefined
    distance: restaurant.distance ?? 0, // Fallback to 0 if undefined
    url: restaurant.url ?? "", // Fallback to empty string if undefined
    reviewCount: restaurant.review_count,
  }));
};

export const fetchNearbyRestaurants = (latitude, longitude, radiusInMeters) => {
  // Yelp API endpoint for search
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&radius=${radiusInMeters}&categories=restaurants`;

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${YELP_API_KEY}`, // Use the API key
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch restaurants");
      }
    })
    .then((data) => {
      // Map through the results to create a new array of restaurant objects
      // with the fields you need
      return data.businesses.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.image_url,
        address: restaurant.location.address1,
        rating: restaurant.rating,
        cuisine: restaurant.categories
          .map((category) => category.title)
          .join(", "),
        price: restaurant.price,
        distance: distance,
        url: url,
        // Add other details from Yelp response you want to use
      }));
    })
    .catch((error) => {
      console.error("Yelp API error:", error);
      return []; // Return an empty array in case of error
    });
};
