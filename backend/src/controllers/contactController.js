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

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * @desc    Get all contact leads with server-side pagination & filter (Admin dashboard)
 * @route   GET /api/v1/contact/all
 * @access  Protected / Admin
 */
export const getAllContactLeads = asyncHandler(async (req, res) => {
  const { search, subject, startDate, endDate, page, limit } = req.query;

  const query = {};

  if (subject && subject !== "All Subjects" && subject !== "all") {
    query.subject = subject;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      const eod = new Date(endDate);
      eod.setHours(23, 59, 59, 999);
      query.createdAt.$lte = eod;
    }
  }

  if (search && search.trim() !== "") {
    const trimmed = search.trim();
    if (/^\d{10}$/.test(trimmed)) {
      query.mobile = trimmed;
    } else {
      const safePattern = escapeRegex(trimmed);
      const searchRegex = new RegExp(safePattern, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { leadId: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  const [leads, total] = await Promise.all([
    ContactLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ContactLead.countDocuments(query),
  ]);

  const formattedLeads = leads.map((lead) => ({
    ...lead,
    submittedOn: lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
  }));

  return new ApiResponse(
    200,
    {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      leads: formattedLeads,
    },
    "Contact leads retrieved successfully"
  ).send(res);
});

/**
 * @desc    Streaming CSV Export for All Contact Leads (Zero-Lag, Stream Cursor)
 * @route   GET /api/v1/contact/export
 * @access  Protected / Admin
 */
export const exportContactLeadsCSV = asyncHandler(async (req, res) => {
  const { search, subject, startDate, endDate } = req.query;

  const query = {};

  if (subject && subject !== "All Subjects" && subject !== "all") {
    query.subject = subject;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      const eod = new Date(endDate);
      eod.setHours(23, 59, 59, 999);
      query.createdAt.$lte = eod;
    }
  }

  if (search && search.trim() !== "") {
    const trimmed = search.trim();
    if (/^\d{10}$/.test(trimmed)) {
      query.mobile = trimmed;
    } else {
      const safePattern = escapeRegex(trimmed);
      const searchRegex = new RegExp(safePattern, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { leadId: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }
  }

  const filename = `Jagran_Contact_Leads_${new Date().toISOString().split("T")[0]}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // CSV UTF-8 BOM for Microsoft Excel compatibility
  res.write("\uFEFF");

  // CSV Headers
  const headers = [
    "S.No",
    "Lead ID",
    "Name",
    "Email Address",
    "Mobile Number",
    "Subject Category",
    "Message Content",
    "Submitted Date & Time",
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  res.write(headers.map(escapeCSV).join(",") + "\n");

  const cursor = ContactLead.find(query).sort({ createdAt: -1 }).cursor();

  let serial = 1;
  for await (const doc of cursor) {
    const dateStr = doc.createdAt
      ? new Date(doc.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      : "-";

    const row = [
      serial++,
      doc.leadId || `L-${serial}`,
      doc.name || "-",
      doc.email || "-",
      doc.mobile || "-",
      doc.subject || "-",
      doc.message ? doc.message.replace(/\r?\n|\r/g, " ") : "-",
      dateStr,
    ];

    res.write(row.map(escapeCSV).join(",") + "\n");
  }

  res.end();
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
