import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const filter = { videoId };
  const skip = (page - 1) * limit;
  const comments = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("userId", "username email");

  const totalComments = await Comment.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        page: Number(page),
        limit: Number(limit),
        totalResults: totalComments,
        totalPages: Math.ceil(totalComments / limit),
        comments,
      },
      "Comments retrieved successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId, text } = req.body;
  const userId = req.user.id;

  if (!videoId || !text) {
    throw new ApiError(400, "Please provide videoId and text");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const comment = await Comment.createSearchIndex({
    videoId,
    text,
    userId,
  });
  res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId, text } = req.body;
  const userId = req.user.id;
  if (!commentId || !text) {
    throw new ApiError(400, "Please provide commentId and text");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.userId.toString() !== userId) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }
  comment.text = text;
  await comment.save();
  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const userId = req.user.id;
  if (!commentId) {
    throw new ApiError(400, "Please provide commentId");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (comment.userId.toString() !== userId) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }
  await comment.findByIdAndDelete(commentId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
