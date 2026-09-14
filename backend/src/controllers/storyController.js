import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Story } from "../models/Story.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

/**
 * Helper function: Evaluate and resolve auto-publishing based on scheduled date & time
 */
const isDateTimeReached = (scheduledDate, scheduledTime = "00:00") => {
  if (!scheduledDate) return false;
  try {
    const timeStr = scheduledTime || "00:00";
    const targetDate = new Date(`${scheduledDate}T${timeStr}:00`);
    if (!isNaN(targetDate.getTime())) {
      return targetDate <= new Date();
    }
  } catch (e) {}

  const todayStr = new Date().toISOString().split("T")[0];
  return scheduledDate <= todayStr;
};

/**
 * @desc Get all stories from MongoDB database (Fast & Lean)
 * @route GET /api/v1/stories/all
 */
export const getAllStories = asyncHandler(async (req, res) => {
  const stories = await Story.find().sort({ storyId: 1 }).lean();

  const resolvedStories = stories.map((story) => {
    const isAutoPublished =
      Boolean(story.isPublished) ||
      (story.scheduledDate ? isDateTimeReached(story.scheduledDate, story.scheduledTime) : false);

    return {
      ...story,
      id: story.storyId,
      isPublished: isAutoPublished,
    };
  });

  return new ApiResponse(
    200,
    resolvedStories,
    "Stories fetched successfully from database"
  ).send(res);
});

/**
 * @desc Get single story by storyId from MongoDB database
 * @route GET /api/v1/stories/:id
 */
export const getStoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const storyId = Number(id);

  if (isNaN(storyId)) {
    throw ApiError.badRequest("Invalid story ID");
  }

  const story = await Story.findOne({ storyId }).lean();
  if (!story) {
    throw ApiError.notFound(`Story with ID ${id} not found`);
  }

  const isPublished =
    Boolean(story.isPublished) ||
    (story.scheduledDate ? isDateTimeReached(story.scheduledDate, story.scheduledTime) : false);

  const storyObj = {
    ...story,
    id: story.storyId,
    isPublished,
  };

  return new ApiResponse(200, storyObj, "Story details fetched successfully").send(res);
});

/**
 * @desc Create or Update Story in MongoDB Database + Upload image to Cloudinary
 * @route POST /api/v1/stories/save
 */
export const createOrUpdateStory = asyncHandler(async (req, res) => {
  const {
    storyId,
    weekEn,
    weekHi,
    titleEn,
    titleHi,
    descEn,
    descHi,
    scheduledDate,
    scheduledTime,
    publishDateEn,
    publishDateHi,
    isPublished,
    existingImage,
  } = req.body;

  if (!storyId || !titleEn || !descEn || !scheduledDate) {
    // Clean temp file if validation failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    throw ApiError.badRequest("storyId, titleEn, descEn, and scheduledDate are required");
  }

  const numStoryId = Number(storyId);
  const story = await Story.findOne({ storyId: numStoryId });

  let imageUrl = existingImage || null;
  let imagePublicId = story ? story.imagePublicId : null;

  // Handle new image upload directly to Cloudinary
  if (req.file) {
    try {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path, "jagran_stories");
      if (cloudinaryResponse) {
        // Delete old Cloudinary image if updating existing story
        const oldImageTarget = story ? story.imagePublicId || story.image : null;
        if (oldImageTarget) {
          deleteFromCloudinary(oldImageTarget).catch(() => {});
        }
        imageUrl = cloudinaryResponse.secure_url;
        imagePublicId = cloudinaryResponse.public_id;
      }
    } catch (uploadErr) {
      console.error("Cloudinary upload notice:", uploadErr);
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      }
    }
  }

  const targetTime = scheduledTime || "00:00";
  const manualPublished = isPublished === "true" || isPublished === true;
  const autoPublished = manualPublished || isDateTimeReached(scheduledDate, targetTime);

  const storyData = {
    storyId: numStoryId,
    weekEn: weekEn || `Week ${numStoryId}`,
    weekHi: weekHi || `सप्ताह ${numStoryId}`,
    titleEn: String(titleEn).trim(),
    titleHi: String(titleHi || titleEn).trim(),
    descEn: String(descEn).trim(),
    descHi: String(descHi || descEn).trim(),
    scheduledDate,
    scheduledTime: targetTime,
    publishDateEn: publishDateEn || scheduledDate,
    publishDateHi: publishDateHi || publishDateEn || scheduledDate,
    isPublished: autoPublished,
    image: imageUrl,
    imagePublicId,
    link: `/story/${numStoryId}`,
  };

  const updatedStory = await Story.findOneAndUpdate(
    { storyId: numStoryId },
    storyData,
    { new: true, upsert: true }
  ).lean();

  const resultObj = {
    ...updatedStory,
    id: updatedStory.storyId,
  };

  return new ApiResponse(
    200,
    resultObj,
    "Story saved successfully in MongoDB and image uploaded to Cloudinary"
  ).send(res);
});

/**
 * @desc Toggle story manual published state in MongoDB Database
 * @route PATCH /api/v1/stories/:id/toggle-publish
 */
export const togglePublishStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const numStoryId = Number(id);

  const story = await Story.findOne({ storyId: numStoryId });
  if (!story) {
    throw ApiError.notFound(`Story with ID ${id} not found`);
  }

  story.isPublished = !story.isPublished;
  await story.save();

  const resultObj = {
    ...story.toObject(),
    id: story.storyId,
  };

  return new ApiResponse(
    200,
    resultObj,
    `Story ${story.isPublished ? "published" : "scheduled"} successfully`
  ).send(res);
});

/**
 * @desc Delete story from MongoDB Database + delete image from Cloudinary
 * @route DELETE /api/v1/stories/:id
 */
export const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const numStoryId = Number(id);

  const story = await Story.findOne({ storyId: numStoryId });
  if (!story) {
    throw ApiError.notFound(`Story with ID ${id} not found`);
  }

  const targetImage = story.imagePublicId || story.image;
  if (targetImage) {
    deleteFromCloudinary(targetImage).catch(() => {});
  }

  await Story.deleteOne({ storyId: numStoryId });

  return new ApiResponse(200, null, "Story deleted successfully").send(res);
});
