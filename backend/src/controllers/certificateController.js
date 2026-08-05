export const sendCertificateEmail = async (req, res) => {
  try {
    const { email, participantName } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email is required" });
    }

    const name = participantName || "Valued Student";
    console.log(`[CERTIFICATE BACKEND] Email request received for ${name} (${email})`);

    return res.status(200).json({
      success: true,
      message: `Certificate request registered for ${email}`,
    });
  } catch (error) {
    console.error("Backend sendCertificate error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const downloadCertificatePdf = async (req, res) => {
  try {
    const name = req.query.name || "Valued Student";

    return res.status(200).json({
      success: true,
      message: `Download requested for ${name}`,
    });
  } catch (error) {
    console.error("Backend downloadCertificate error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
