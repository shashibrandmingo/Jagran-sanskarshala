import mongoose from "mongoose";

// Image Schema embedded in Category
const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    public_id: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Gallery Category Schema
const categorySchema = new mongoose.Schema(
  {
    categoryTitle: {
      type: String,
      required: [true, "Category title (English) is required"],
      trim: true,
    },
    categoryTitleHi: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      required: [true, "Edition year is required"],
      trim: true,
      index: true,
    },
    images: [photoSchema],
  },
  { timestamps: true }
);

// Edition / Year Tab Schema
const galleryYearSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: [true, "Year is required"],
      unique: true,
      trim: true,
    },
    title: {
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    subtitle: {
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const GalleryCategory = mongoose.model("GalleryCategory", categorySchema);
export const GalleryYear = mongoose.model("GalleryYear", galleryYearSchema);
