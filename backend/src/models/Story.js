import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    storyId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    weekEn: {
      type: String,
      required: true,
      trim: true,
    },
    weekHi: {
      type: String,
      required: true,
      trim: true,
    },
    titleEn: {
      type: String,
      required: true,
      trim: true,
    },
    titleHi: {
      type: String,
      required: true,
      trim: true,
    },
    descEn: {
      type: String,
      required: true,
      trim: true,
    },
    descHi: {
      type: String,
      required: true,
      trim: true,
    },
    fullBodyEn: {
      type: String,
      default: "Coming soon...",
    },
    fullBodyHi: {
      type: String,
      default: "जल्द आ रहा है...",
    },
    scheduledDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    publishDateEn: {
      type: String,
      required: true,
    },
    publishDateHi: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String, // Cloudinary Image URL
      default: null,
    },
    imagePublicId: {
      type: String, // Cloudinary Public ID for deletion
      default: null,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Story = mongoose.model("Story", storySchema);
