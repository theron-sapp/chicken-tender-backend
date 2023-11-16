//  ChickenTender-Backend/controllers/restaurantController.js

import fetch from "node-fetch";

// Replace `YELP_API_KEY` with the actual API key for Yelp
const YELP_API_KEY = process.env.YELP_API_KEY;

export async function fetchNearbyRestaurants(req, res) {
  const { latitude, longitude, radiusInMeters } = req.query;

  // Yelp API endpoint for search
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&radius=${radiusInMeters}&categories=restaurants`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`, // Use the API key from environment variables
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch restaurants");
    }

    const data = await response.json();
    // Map through the results to create a new array of restaurant objects
    const restaurants = data.businesses.map((restaurant) => ({
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

    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Yelp API error:", error);
    res
      .status(500)
      .json({ message: "Error fetching restaurants from Yelp", error });
  }
}
