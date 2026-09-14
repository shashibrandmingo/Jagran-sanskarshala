import SurveySubmission from "../models/SurveySubmission.js";

/**
 * Helper to escape CSV fields properly
 */
const escapeCsvField = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * @desc    Submit a new Survey Response (Student or Parent)
 * @route   POST /api/v1/survey/submit
 * @access  Public
 */
export const submitSurvey = async (req, res) => {
  try {
    const {
      type,
      firstName,
      lastName,
      email,
      mobile,
      dob,
      gender,
      occupation,
      studentClass,
      state,
      city,
      school,
      answers,
      grade,
    } = req.body;

    // Basic Validations
    if (!type || !["Student", "Parent"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing survey type. Must be 'Student' or 'Parent'.",
      });
    }

    if (!firstName || !lastName || !email || !state || !city) {
      return res.status(400).json({
        success: false,
        message: "All mandatory profile fields must be provided.",
      });
    }

    const cleanMobile = mobile ? String(mobile).trim() : "";

    if (type === "Parent" && !cleanMobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required for Parent survey.",
      });
    }

    if (cleanMobile && !/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    // Check duplicate mobile per form type
    if (cleanMobile) {
      const existingSubmission = await SurveySubmission.findOne({
        mobile: cleanMobile,
        type: type,
      }).lean();

      if (existingSubmission) {
        const typeLabelHindi = type === "Student" ? "छात्र" : "अभिभावक";
        return res.status(400).json({
          success: false,
          code: "DUPLICATE_MOBILE",
          message: `You have already submitted a ${type} survey using this mobile number (${cleanMobile}). / आप इस मोबाइल नंबर (${cleanMobile}) से पहले ही ${typeLabelHindi} सर्वेक्षण भर चुके हैं।`,
        });
      }
    }

    // Create Survey Submission Document
    const newSubmission = await SurveySubmission.create({
      type,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanMobile || "-",
      dob: dob || "-",
      gender: gender || "-",
      occupation: occupation || "-",
      studentClass: studentClass || "-",
      state: state.trim(),
      city: city.trim(),
      school: school || "-",
      answers: answers || {},
      grade: ["A++", "A+", "A"].includes(grade) ? grade : "A",
    });

    return res.status(201).json({
      success: true,
      message: `${type} Survey submission recorded successfully!`,
      data: newSubmission,
    });
  } catch (error) {
    console.error("Survey submission error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting the survey. Please try again.",
    });
  }
};

/**
 * Helper to build Mongo query filter from request params
 */
const buildSurveyQuery = (params) => {
  const { search, tab, state, city, school, startDate, endDate } = params;
  const query = {};

  if (tab === "student") {
    query.type = "Student";
  } else if (tab === "parent") {
    query.type = "Parent";
  }

  if (state && state !== "all") query.state = state;
  if (city && city !== "all") query.city = city;
  if (school && school !== "all") query.school = school;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search && search.trim() !== "") {
    const trimmed = search.trim();
    // If search looks like a 10 digit number, match mobile exactly for blazing speed
    if (/^\d{10}$/.test(trimmed)) {
      query.mobile = trimmed;
    } else {
      const searchRegex = new RegExp(trimmed, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { school: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
      ];
    }
  }

  return query;
};

/**
 * @desc    Get Paginated Survey Submissions (Fast & Lean for Admin Table)
 * @route   GET /api/v1/survey/all
 * @access  Protected (Admin)
 */
export const getAllSurveys = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const query = buildSurveyQuery(req.query);

    // Parallel count & paginated fetch without heavy answers field
    const [total, submissions] = await Promise.all([
      SurveySubmission.countDocuments(query),
      SurveySubmission.find(query)
        .select("-answers")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Format for Admin Dashboard
    const formattedData = submissions.map((item, idx) => ({
      id: String(item._id).substring(18, 24).toUpperCase() || String(102500 - (skip + idx)),
      _id: item._id,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      mobile: item.mobile,
      dob: item.dob,
      gender: item.gender,
      type: item.type,
      occupation: item.occupation,
      studentClass: item.studentClass,
      state: item.state,
      city: item.city,
      school: item.school,
      grade: item.grade || "A",
      submittedOn: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        : "-",
    }));

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: formattedData,
    });
  } catch (error) {
    console.error("Get surveys error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching survey submissions.",
    });
  }
};

/**
 * @desc    Get single Survey full details (including answers)
 * @route   GET /api/v1/survey/detail/:id
 * @access  Protected (Admin)
 */
export const getSurveyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await SurveySubmission.findById(id).lean();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey submission not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error("Get survey detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching survey details.",
    });
  }
};

/**
 * @desc    Get Survey Summary Statistics (Total, Parent, Student, Today counts)
 * @route   GET /api/v1/survey/stats
 * @access  Protected (Admin)
 */
export const getSurveyStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, studentCount, parentCount, todayCount] = await Promise.all([
      SurveySubmission.estimatedDocumentCount(),
      SurveySubmission.countDocuments({ type: "Student" }),
      SurveySubmission.countDocuments({ type: "Parent" }),
      SurveySubmission.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        studentCount,
        parentCount,
        todayCount,
      },
    });
  } catch (error) {
    console.error("Get survey stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching survey stats.",
    });
  }
};

/**
 * @desc    Stream full survey data export as CSV (Handles 128k+ records with ~15MB RAM)
 * @route   GET /api/v1/survey/export
 * @access  Protected (Admin)
 */
export const exportSurveysCsv = async (req, res) => {
  try {
    const query = buildSurveyQuery(req.query);

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="jagran_surveys_${timestamp}.csv"`
    );

    // UTF-8 BOM for Microsoft Excel compatibility
    res.write("\uFEFF");

    // CSV Headers
    const headers = [
      "ID",
      "Type",
      "First Name",
      "Last Name",
      "Email",
      "Mobile",
      "Gender",
      "Date of Birth",
      "State",
      "City",
      "School",
      "Class",
      "Occupation",
      "Grade",
      "Submitted On",
    ];
    res.write(headers.join(",") + "\n");

    // Stream records via Mongo Cursor
    const cursor = SurveySubmission.find(query)
      .select("-answers")
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    let count = 0;
    for await (const doc of cursor) {
      count++;
      const formattedDate = doc.createdAt
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
        escapeCsvField(String(doc._id).substring(18, 24).toUpperCase() || count),
        escapeCsvField(doc.type || "-"),
        escapeCsvField(doc.firstName || "-"),
        escapeCsvField(doc.lastName || "-"),
        escapeCsvField(doc.email || "-"),
        escapeCsvField(doc.mobile || "-"),
        escapeCsvField(doc.gender || "-"),
        escapeCsvField(doc.dob || "-"),
        escapeCsvField(doc.state || "-"),
        escapeCsvField(doc.city || "-"),
        escapeCsvField(doc.school || "-"),
        escapeCsvField(doc.studentClass || "-"),
        escapeCsvField(doc.occupation || "-"),
        escapeCsvField(doc.grade || "A"),
        escapeCsvField(formattedDate),
      ];

      res.write(row.join(",") + "\n");
    }

    res.end();
  } catch (error) {
    console.error("Export surveys CSV error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to export surveys CSV.",
      });
    }
    res.end();
  }
};
