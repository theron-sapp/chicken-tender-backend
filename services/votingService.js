// ./services/votingService.js

import Session from "../models/Session.js";

export const recordVote = async (code, yelpBusinessId, userVote) => {
  const session = await Session.findOne({ code });

  if (!session) {
    throw new Error("Session not found");
  }

  // If the user votes 'like', find the vote object or create a new one, then increment the count.
  if (userVote === "like") {
    let voteEntry = session.votes.find(
      (v) => v.yelpBusinessId === yelpBusinessId
    );
    if (voteEntry) {
      voteEntry.count++; // Increment existing count
    } else {
      // Create a new vote entry for the restaurant
      session.votes.push({ yelpBusinessId, count: 1 });
    }
  }
  // No action needed if the user votes 'dislike'

  await session.save();

  // Return the updated session object
  return session;
};

export const tallyVotes = async (session) => {
  const highestVotesCount = Math.max(
    ...session.votes.map((vote) => vote.count)
  );

  // Find the restaurant with the highest votes count
  const winningRestaurant = session.restaurants.find((restaurant) => {
    const restaurantVotes = session.votes.find(
      (vote) => vote.yelpBusinessId === restaurant.id
    );
    return restaurantVotes && restaurantVotes.count === highestVotesCount;
  });

  // Return the restaurant name
  if (winningRestaurant) {
    const { id, name, image, address, rating, price, distance } =
      winningRestaurant;
    return {
      id,
      name,
      image,
      address,
      rating,
      price,
      distance,
    };
  } else {
    return null;
  }
};
