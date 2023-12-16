// ./services/votingService.js

import Session from "../models/Session.js";

export const recordVote = async (code, place_id, userVote) => {
  const session = await Session.findOne({ code });

  if (!session) {
    throw new Error("Session not found");
  }

  // If the user votes 'like', find the vote object or create a new one, then increment the count.
  if (userVote === "like") {
    let voteEntry = session.votes.find((v) => v.place_id === place_id);
    if (voteEntry) {
      voteEntry.count++; // Increment existing count
    } else {
      // Create a new vote entry for the restaurant
      session.votes.push({ place_id, count: 1 });
    }
  }

  await session.save();

  // Return the updated session object
  return session;
};

// export const tallyVotes = async (session) => {
//   const highestVotesCount = Math.max(
//     ...session.votes.map((vote) => vote.count)
//   );

//   // Find the restaurant with the highest votes count
//   const winningRestaurant = session.restaurants.find((restaurant) => {
//     const restaurantVotes = session.votes.find(
//       (vote) => vote.place_id === restaurant.id
//     );
//     return restaurantVotes && restaurantVotes.count === highestVotesCount;
//   });

//   // Return the restaurant name
//   if (winningRestaurant) {
//     const { id, name, image, address, rating, price, distance } =
//       winningRestaurant;
//     return {
//       id,
//       name,
//       image,
//       address,
//       rating,
//       price,
//       distance,
//     };
//   } else {
//     return null;
//   }
// };

export const tallyVotes = async (session) => {
  const highestVotesCount = Math.max(
    ...session.votes.map((vote) => vote.count)
  );

  // Find all restaurants with the highest votes count
  const topVotedRestaurants = session.restaurants.filter((restaurant) => {
    const restaurantVotes = session.votes.find(
      (vote) => vote.place_id === restaurant.id
    );
    return restaurantVotes && restaurantVotes.count === highestVotesCount;
  });

  // Randomly select one of the top-voted restaurants
  if (topVotedRestaurants.length > 0) {
    const randomIndex = Math.floor(Math.random() * topVotedRestaurants.length);
    const winningRestaurant = topVotedRestaurants[randomIndex];

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
