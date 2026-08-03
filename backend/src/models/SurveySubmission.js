import mongoose from "mongoose";

const surveySubmissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Student", "Parent"],
      required: [true, "Survey type (Student or Parent) is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Mobile number must be a valid 10-digit number"],
    },
    dob: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "-",
    },
    occupation: {
      type: String,
      default: "-",
    },
    studentClass: {
      type: String,
      default: "-",
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    school: {
      type: String,
      default: "-",
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: 1 mobile number can only submit 1 Student survey and 1 Parent survey
surveySubmissionSchema.index({ mobile: 1, type: 1 }, { unique: true });

const SurveySubmission = mongoose.model("SurveySubmission", surveySubmissionSchema);

export default SurveySubmission;
