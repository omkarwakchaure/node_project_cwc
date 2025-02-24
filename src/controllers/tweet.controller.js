import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Please provide tweet content");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const tweet = await Tweet.create({
    content,
    userId,
    createdAt: new Date(),
  });
  res
    .status(201)
    .json(new ApiResponse(201, { tweet }, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const skip = (page - 1) * limit;

  const tweets = await Tweet.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalTweets = await Tweet.countDocuments({ userId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        page: Number(page),
        limit: Number(limit),
        totalResults: totalTweets,
        totalPages: Math.ceil(totalTweets / limit),
        tweets,
      },
      "User tweets retrieved successfully"
    )
  );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  tweet.content = content;
  await tweet.save();

  res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  await tweet.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
