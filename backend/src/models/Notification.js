import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["Hindi", "English", "Both"],
      default: "Both",
    },
    msgEn: {
      type: String,
      trim: true,
      maxlength: [160, "English message cannot exceed 160 characters"],
      default: "",
    },
    msgHi: {
      type: String,
      trim: true,
      maxlength: [160, "Hindi message cannot exceed 160 characters"],
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Sent", "Published", "Draft"],
      default: "Sent",
    },
    sentOn: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
