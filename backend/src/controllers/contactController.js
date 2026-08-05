import ContactLead from "../models/ContactLead.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

/**
 * @desc    Submit a new contact form request
 * @route   POST /api/v1/contact/submit
 * @access  Public
 */
export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, mobile, subject, message } = req.body;

  // Validation
  const errors = {};

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.name = "Full Name is required";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
    errors.name = "Name should contain only letters";
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  const cleanMobile = mobile ? String(mobile).trim() : "";
  if (!cleanMobile) {
    errors.mobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    errors.mobile = "Enter a valid 10-digit mobile number (starts 6-9)";
  }

  if (!subject || typeof subject !== "string" || !subject.trim()) {
    errors.subject = "Please select a subject";
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    errors.message = "Message is required";
  } else if (message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters long";
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("Validation failed", errors);
  }

  // Create Lead in MongoDB
  const newLead = await ContactLead.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    mobile: cleanMobile,
    subject: subject.trim(),
    message: message.trim(),
  });

  return new ApiResponse(
    201,
    newLead,
    "Your message has been successfully received!"
  ).send(res);
});

/**
 * @desc    Get all contact leads (Admin dashboard)
 * @route   GET /api/v1/contact/all
 * @access  Protected / Admin
 */
export const getAllContactLeads = asyncHandler(async (req, res) => {
  const { search, subject, startDate, endDate } = req.query;

  const query = {};

  if (subject && subject !== "All Subjects") {
    query.subject = subject;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const eod = new Date(endDate);
      eod.setHours(23, 59, 59, 999);
      query.createdAt.$lte = eod;
    }
  }

  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
      { leadId: searchRegex },
      { subject: searchRegex },
      { message: searchRegex },
    ];
  }

  const leads = await ContactLead.find(query).sort({ createdAt: -1 });

  return new ApiResponse(
    200,
    {
      total: leads.length,
      leads,
    },
    "Contact leads retrieved successfully"
  ).send(res);
});

/**
 * @desc    Delete contact lead (Admin)
 * @route   DELETE /api/v1/contact/:id
 * @access  Protected / Admin
 */
export const deleteContactLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await ContactLead.findByIdAndDelete(id);

  if (!lead) {
    throw ApiError.notFound("Contact lead not found");
  }

  return new ApiResponse(200, null, "Contact lead deleted successfully").send(
    res
  );
});
