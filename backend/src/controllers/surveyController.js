import SurveySubmission from "../models/SurveySubmission.js";

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
    } = req.body;

    // Basic Validations
    if (!type || !["Student", "Parent"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing survey type. Must be 'Student' or 'Parent'.",
      });
    }

    if (!firstName || !lastName || !email || !mobile || !state || !city) {
      return res.status(400).json({
        success: false,
        message: "All mandatory profile fields must be provided.",
      });
    }

    const cleanMobile = String(mobile).trim();

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    // CHECK DUPLICATE MOBILE PER FORM TYPE
    const existingSubmission = await SurveySubmission.findOne({
      mobile: cleanMobile,
      type: type,
    });

    if (existingSubmission) {
      const typeLabelHindi = type === "Student" ? "छात्र" : "अभिभावक";
      return res.status(400).json({
        success: false,
        code: "DUPLICATE_MOBILE",
        message: `You have already submitted a ${type} survey using this mobile number (${cleanMobile}). / आप इस मोबाइल नंबर (${cleanMobile}) से पहले ही ${typeLabelHindi} सर्वेक्षण भर चुके हैं।`,
      });
    }

    // Create Survey Submission Document
    const newSubmission = await SurveySubmission.create({
      type,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanMobile,
      dob: dob || "-",
      gender: gender || "-",
      occupation: occupation || "-",
      studentClass: studentClass || "-",
      state: state.trim(),
      city: city.trim(),
      school: school || "-",
      answers: answers || {},
    });

    return res.status(201).json({
      success: true,
      message: `${type} Survey submission recorded successfully!`,
      data: newSubmission,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000) safety net
    if (error.code === 11000) {
      const type = req.body?.type || "Survey";
      const typeLabelHindi = type === "Student" ? "छात्र" : "अभिभावक";
      return res.status(400).json({
        success: false,
        code: "DUPLICATE_MOBILE",
        message: `You have already submitted a ${type} survey using this mobile number. / आप इस मोबाइल नंबर से पहले ही ${typeLabelHindi} सर्वेक्षण भर चुके हैं।`,
      });
    }

    console.error("Survey submission error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting the survey. Please try again.",
    });
  }
};

/**
 * @desc    Get all Survey Submissions (with filters & search for Admin Dashboard)
 * @route   GET /api/v1/survey/all
 * @access  Protected (Admin)
 */
export const getAllSurveys = async (req, res) => {
  try {
    const {
      search,
      tab,
      state,
      city,
      school,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // Filter by Tab (Student / Parent)
    if (tab === "student") {
      query.type = "Student";
    } else if (tab === "parent") {
      query.type = "Parent";
    }

    // Filter by State, City, School
    if (state && state !== "all") query.state = state;
    if (city && city !== "all") query.city = city;
    if (school && school !== "all") query.school = school;

    // Date Range Filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search Query (FirstName, LastName, Email, Mobile, School, City)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
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

    const submissions = await SurveySubmission.find(query).sort({ createdAt: -1 });

    // Format for Admin Dashboard
    const formattedData = submissions.map((item, idx) => ({
      id: String(item._id).substring(18, 24).toUpperCase() || String(102500 - idx),
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
      submittedOn: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "-",
    }));

    return res.status(200).json({
      success: true,
      total: formattedData.length,
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
 * @desc    Get Survey Summary Statistics (Total, Parent, Student counts)
 * @route   GET /api/v1/survey/stats
 * @access  Protected (Admin)
 */
export const getSurveyStats = async (req, res) => {
  try {
    const total = await SurveySubmission.countDocuments();
    const studentCount = await SurveySubmission.countDocuments({ type: "Student" });
    const parentCount = await SurveySubmission.countDocuments({ type: "Parent" });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        studentCount,
        parentCount,
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
