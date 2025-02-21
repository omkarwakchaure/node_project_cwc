import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const userId = req.user.id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  let like = await Like.findOne({ userId, videoId });
  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed successfully"));
  }
  await Like.create({ userId, videoId });
  res.status(200).json(new ApiResponse(200, null, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user.id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  let like = await Like.findOne({ userId, commentId });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment unliked successfully"));
  }

  await Like.create({ userId, commentId });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user.id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  let like = await Like.findOne({ userId, tweetId });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet unliked successfully"));
  }

  await Like.create({ userId, tweetId });

  res.status(200).json(new ApiResponse(200, null, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.find({ userId }).populate("videoId");

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos retrieved successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
