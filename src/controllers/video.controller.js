import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    let filter = {};
    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }
    if (userId) {
      filter.userId = userId;
    }

    let sorting = {};
    sorting[sortBy] = sortType;
    const skip = (page - 1) * limit;

    const videos = await Video.find(filter)
      .sort(sorting)
      .skip(skip)
      .limit(Number(limit));

    const totalVideos = await Video.countDocuments(filter);

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalResults: totalVideos,
      totalPages: Math.ceil(totalVideos / limit),
      data: videos,
    });
  } catch (error) {
    throw new ApiError(400, "Error fetching videos");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if (!req.file) {
      throw new ApiError(400, "Please upload a video");
    }
    const result = await uploadOnCloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "videos",
    });

    const newVideo = await Video.create({
      title,
      description,
      videoUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedAt: new Date(),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { data: newVideo }, "Video uploaded successfully")
      );
  } catch (error) {
    throw new ApiError(400, "Error uploading video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video retrieved successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (req.file) {
    const uploadResult = await uploadOnCloudinary.uploader.upload(
      req.file.path,
      {
        folder: "video-thumbnails",
      }
    );
    video.thumbnail = uploadResult.secure_url;
  }
  if (title) video.title = title;
  if (description) video.description = description;
  await video.save();
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  await uploadOnCloudinary.uploader.destroy(video.cloudinaryId, {
    resource_type: "video",
  });
  await video.findByIdAndDelete(videoId);
  res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle video publish status
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
