// ./services/votingService.js

import Session from "../models/Session.js";

export const recordVote = async (code, userId, yelpBusinessId, userVote) => {
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

export const tallyVotes = async (code) => {
  const session = await Session.findOne({ code });
  if (!session) {
    throw new Error("Session not found");
  }

  // Check if all users have finished voting.
  const allHaveVoted = session.userStatuses.every((user) => user.hasVoted);
  if (!allHaveVoted) {
    throw new Error("Voting is not yet complete");
  }

  // If all users have voted, tally the votes.
  const tally = session.votes.reduce((acc, vote) => {
    if (!acc[vote.yelpBusinessId]) {
      acc[vote.yelpBusinessId] = 0;
    }
    acc[vote.yelpBusinessId] += vote.count;
    return acc;
  }, {});

  // Find the restaurant with the most votes.
  let maxVotes = 0;
  let winningRestaurant = null;
  for (const [key, value] of Object.entries(tally)) {
    if (value > maxVotes) {
      maxVotes = value;
      winningRestaurant = key;
    }
  }

  // Respond with the winning restaurant.
  return { winningRestaurant, tally };
};
