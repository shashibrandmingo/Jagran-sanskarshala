import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { GalleryCategory, GalleryYear } from "../models/Gallery.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

/* =========================================================
   PUBLIC / FRONTEND CONTROLLER METHODS
   ========================================================= */

/**
 * @desc Get all gallery data (Years & Categories with Photos)
 * @route GET /api/v1/gallery
 */
export const getGalleryData = asyncHandler(async (req, res) => {
  const years = await GalleryYear.find().sort({ year: -1 });
  const categories = await GalleryCategory.find().sort({ createdAt: -1 });

  return new ApiResponse(
    200,
    { years, categories },
    "Gallery data fetched successfully"
  ).send(res);
});

/* =========================================================
   ADMIN CONTROLLER METHODS (CATEGORIES, YEARS & PHOTOS)
   ========================================================= */

/**
 * @desc Add New Edition Year Tab
 * @route POST /api/v1/gallery/years
 */
export const addGalleryYear = asyncHandler(async (req, res) => {
  const { year, title, subtitle } = req.body;

  if (!year || !year.trim()) {
    throw ApiError.badRequest("Year is required");
  }

  const existingYear = await GalleryYear.findOne({ year: year.trim() });
  if (existingYear) {
    throw ApiError.conflict("Edition year already exists");
  }

  const newYearObj = await GalleryYear.create({
    year: year.trim(),
    title: {
      en: title?.en || title?.hi || `Sanskarshala ${year.trim()}`,
      hi: title?.hi || title?.en || `संस्कारशाला ${year.trim()}`,
    },
    subtitle: {
      en: subtitle?.en || `(${year.trim()})`,
      hi: subtitle?.hi || `(${year.trim()})`,
    },
  });

  return new ApiResponse(201, newYearObj, "New year edition added successfully").send(res);
});

/**
 * @desc Delete Edition Year Tab
 * @route DELETE /api/v1/gallery/years/:yearVal
 */
export const deleteGalleryYear = asyncHandler(async (req, res) => {
  const { yearVal } = req.params;

  if (yearVal === "All") {
    throw ApiError.badRequest("Cannot delete 'All' year filter");
  }

  const deletedYear = await GalleryYear.findOneAndDelete({ year: yearVal });
  if (!deletedYear) {
    throw ApiError.notFound("Edition year not found");
  }

  return new ApiResponse(200, deletedYear, "Edition year deleted successfully").send(res);
});

/**
 * @desc Add New Category
 * @route POST /api/v1/gallery/categories
 */
export const addGalleryCategory = asyncHandler(async (req, res) => {
  const { categoryTitle, categoryTitleHi, year } = req.body;

  if (!categoryTitle || !categoryTitle.trim() || !year) {
    throw ApiError.badRequest("Category title and target year are required");
  }

  const newCategory = await GalleryCategory.create({
    categoryTitle: categoryTitle.trim(),
    categoryTitleHi: categoryTitleHi ? categoryTitleHi.trim() : categoryTitle.trim(),
    year: year.trim(),
    images: [],
  });

  return new ApiResponse(201, newCategory, "Category created successfully").send(res);
});

/**
 * @desc Update Category Name / Year
 * @route PUT /api/v1/gallery/categories/:id
 */
export const updateGalleryCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryTitle, categoryTitleHi, year } = req.body;

  const category = await GalleryCategory.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  if (categoryTitle) category.categoryTitle = categoryTitle.trim();
  if (categoryTitleHi !== undefined) category.categoryTitleHi = categoryTitleHi.trim();
  if (year) category.year = year.trim();

  await category.save();

  return new ApiResponse(200, category, "Category updated successfully").send(res);
});

/**
 * @desc Delete Category & All its Cloudinary Images
 * @route DELETE /api/v1/gallery/categories/:id
 */
export const deleteGalleryCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await GalleryCategory.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  // Delete all photos from Cloudinary
  if (category.images && category.images.length > 0) {
    for (const img of category.images) {
      if (img.public_id) {
        await deleteFromCloudinary(img.public_id);
      }
    }
  }

  await GalleryCategory.findByIdAndDelete(id);

  return new ApiResponse(200, null, "Category and all associated images deleted from Cloudinary").send(res);
});

/**
 * @desc Upload Single / Batch Photos to Cloudinary & Save to Category
 * @route POST /api/v1/gallery/photos
 */
export const uploadGalleryPhotos = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;

  if (!categoryId) {
    // Clean up files if categoryId missing
    if (req.files) {
      req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    }
    throw ApiError.badRequest("Target Category ID is required");
  }

  const category = await GalleryCategory.findById(categoryId);
  if (!category) {
    if (req.files) {
      req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    }
    throw ApiError.notFound("Category not found");
  }

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest("No image files provided for upload");
  }

  const uploadedPhotos = [];

  // Upload each file to Cloudinary in parallel or sequential batch
  for (const file of req.files) {
    const cloudinaryResult = await uploadOnCloudinary(file.path, "jagran_gallery");
    if (cloudinaryResult) {
      uploadedPhotos.push({
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      });
    }
  }

  if (uploadedPhotos.length === 0) {
    throw ApiError.internal("Failed to upload images to Cloudinary");
  }

  // Push uploaded photo objects into category
  category.images.unshift(...uploadedPhotos);
  await category.save();

  return new ApiResponse(
    201,
    category,
    `${uploadedPhotos.length} photo(s) uploaded to Cloudinary successfully`
  ).send(res);
});

/**
 * @desc Delete Single Photo from Category & Delete from Cloudinary
 * @route DELETE /api/v1/gallery/categories/:catId/photos/:photoId
 */
export const deleteGalleryPhoto = asyncHandler(async (req, res) => {
  const { catId, photoId } = req.params;

  const category = await GalleryCategory.findById(catId);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  const photo = category.images.id(photoId);
  if (!photo) {
    throw ApiError.notFound("Photo not found in category");
  }

  // Delete from Cloudinary using stored public_id
  if (photo.public_id) {
    await deleteFromCloudinary(photo.public_id);
  }

  // Remove photo subdocument
  category.images.pull(photoId);
  await category.save();

  return new ApiResponse(200, category, "Photo deleted from gallery and Cloudinary").send(res);
});
