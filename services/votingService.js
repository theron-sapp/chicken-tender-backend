// ./services/votingService.js

import Session from "../models/Session.js";

// export const recordVote = async (code, place_id, userVote) => {
//   const session = await Session.findOne({ code });

//   if (!session) {
//     throw new Error("Session not found");
//   }

//   // If the user votes 'like', find the vote object or create a new one, then increment the count.
//   if (userVote === "like") {
//     let voteEntry = session.votes.find((v) => v.place_id === place_id);
//     if (voteEntry) {
//       voteEntry.count++; // Increment existing count
//     } else {
//       // Create a new vote entry for the restaurant
//       session.votes.push({ place_id, count: 1 });
//     }
//   }

//   await session.save();

//   // Return the updated session object
//   return session;
// };

export const recordVote = async (code, place_id, userVote) => {
  // Define a helper function to attempt the vote update
  const attemptVoteUpdate = async (retryCount = 0) => {
    try {
      const session = await Session.findOne({ code });

      if (!session) {
        throw new Error("Session not found");
      }

      if (userVote === "like") {
        let voteEntry = session.votes.find((v) => v.place_id === place_id);
        if (voteEntry) {
          voteEntry.count++;
        } else {
          session.votes.push({ place_id, count: 1 });
        }
      }

      await session.save();
      return session;
    } catch (error) {
      // Check if the error is a VersionError and the retryCount is below the threshold
      if (error.name === "VersionError" && retryCount < 3) {
        console.log("Retrying vote update due to VersionError");
        return await attemptVoteUpdate(retryCount + 1);
      } else {
        throw error; // Re-throw the error if it's not a VersionError or retry count exceeded
      }
    }
  };

  // Initial call to the helper function
  return await attemptVoteUpdate();
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
  // if (
  //   session.winningRestaurant &&
  //   Object.keys(session.winningRestaurant).length > 0
  // ) {
  //   console.log("votingserver.js line 62 - Winning restaurant already set");
  //   return session.winningRestaurant;
  // }

  const highestVotesCount = Math.max(
    ...session.votes.map((vote) => vote.count)
  );

  console.log("votingservice.js line 70");

  // Find all restaurants with the highest votes count
  const topVotedRestaurants = session.restaurants.filter((restaurant) => {
    const restaurantVotes = session.votes.find(
      (vote) => vote.place_id === restaurant.id
    );
    console.log("votingservice.js line 75");
    return restaurantVotes && restaurantVotes.count === highestVotesCount;
  });

  // Randomly select one of the top-voted restaurants
  if (topVotedRestaurants.length > 0) {
    const randomIndex = Math.floor(Math.random() * topVotedRestaurants.length);
    const winningRestaurant = topVotedRestaurants[randomIndex];
    console.log(`Winning restaurant: ${winningRestaurant}`);

    // Update the session with the winning restaurant
    session.winningRestaurant = {
      id: winningRestaurant.id,
      name: winningRestaurant.name,
      image: winningRestaurant.image,
      address: winningRestaurant.address,
      rating: winningRestaurant.rating,
      price: winningRestaurant.price,
      distance: winningRestaurant.distance,
    };
    await session.save();
    console.log("votingservice.js line 96");
    return session.winningRestaurant;
  } else {
    return null;
  }
};
