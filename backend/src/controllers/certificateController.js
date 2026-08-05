import path from "path";
import fs from "fs";

export const sendCertificateEmail = async (req, res) => {
  try {
    const { email, participantName } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email is required" });
    }

    const name = participantName || "Valued Student";

    // Simulate / log email sent status from Express backend
    console.log(`[CERTIFICATE BACKEND EMAIL] Request received for ${name} (${email})`);

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
    const sanitizedFilename = `Sanskarshala_Certificate_${name
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .replace(/\s+/g, "_")}.pdf`;

    // Locate PDF template in public folder or fallback
    const frontendPublicPath = path.join(process.cwd(), "..", "jagransanskarshala", "public", "Certificatefinal.pdf");
    const localPublicPath = path.join(process.cwd(), "public", "Certificatefinal.pdf");

    const templatePath = fs.existsSync(frontendPublicPath) ? frontendPublicPath : localPublicPath;

    if (fs.existsSync(templatePath)) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${sanitizedFilename}"`);
      return fs.createReadStream(templatePath).pipe(res);
    }

    return res.status(404).json({ success: false, error: "Certificate template file not found" });
  } catch (error) {
    console.error("Backend downloadCertificate error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
