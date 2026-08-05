import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const sendCertificateEmail = async (req, res) => {
  try {
    const { email, participantName } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email is required" });
    }

    const name = participantName || "Valued Student";

    // 1. Locate and Generate Personalized PDF
    const frontendPublicPath = path.join(process.cwd(), "..", "jagransanskarshala", "public", "Certificatefinal.pdf");
    const localPublicPath = path.join(process.cwd(), "public", "Certificatefinal.pdf");
    const templatePath = fs.existsSync(frontendPublicPath) ? frontendPublicPath : localPublicPath;

    let pdfBuffer;
    if (fs.existsSync(templatePath)) {
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const page = pdfDoc.getPages()[0];

      let fontSize = 24;
      if (name.length > 25) fontSize = 20;
      if (name.length > 35) fontSize = 16;

      const mrMsEndX = 296;
      const lineEndX = 602;
      const textWidth = font.widthOfTextAtSize(name, fontSize);
      const availableWidth = lineEndX - mrMsEndX;
      const x = mrMsEndX + (availableWidth - textWidth) / 2;
      const y = 210;

      page.drawText(name, {
        x: Math.max(mrMsEndX, x),
        y,
        size: fontSize,
        font,
        color: rgb(0.627, 0.062, 0.074),
      });

      const pdfBytes = await pdfDoc.save();
      pdfBuffer = Buffer.from(pdfBytes);
    }

    // SMTP Config from process.env with fallbacks
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = (process.env.SMTP_USER || "pradeepgaur1825@gmail.com").trim();
    let pass = (process.env.SMTP_PASS || "cmpyanjzpeillmwi").replace(/^your-/i, "").replace(/\s+/g, "").trim();
    const from = process.env.SMTP_FROM || `"Dainik Jagran Sanskarshala" <${user}>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Certificate of Participation</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #a01013;">Jagran Sanskarshala</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for participating in <strong>Dainik Jagran Sanskarshala Survey 2026</strong>.</p>
      <p>Your official Certificate of Participation is attached to this email.</p>
      <br>
      <p>Regards,<br><strong>Team Dainik Jagran</strong></p>
    </body>
    </html>
    `;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Sanskarshala_Certificate_${name.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `🎓 Official Participation Certificate - Dainik Jagran Sanskarshala 2026`,
      html: htmlContent,
      attachments,
    });

    console.log(`[EMAIL SENT SUCCESS] MessageId: ${info.messageId} to ${email}`);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: `Certificate & Email sent successfully to ${email}`,
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

    const frontendPublicPath = path.join(process.cwd(), "..", "jagransanskarshala", "public", "Certificatefinal.pdf");
    const localPublicPath = path.join(process.cwd(), "public", "Certificatefinal.pdf");
    const templatePath = fs.existsSync(frontendPublicPath) ? frontendPublicPath : localPublicPath;

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ success: false, error: "Certificate template file not found" });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const page = pdfDoc.getPages()[0];

    let fontSize = 24;
    if (name.length > 25) fontSize = 20;
    if (name.length > 35) fontSize = 16;

    const mrMsEndX = 296;
    const lineEndX = 602;
    const textWidth = font.widthOfTextAtSize(name, fontSize);
    const availableWidth = lineEndX - mrMsEndX;
    const x = mrMsEndX + (availableWidth - textWidth) / 2;
    const y = 210;

    page.drawText(name, {
      x: Math.max(mrMsEndX, x),
      y,
      size: fontSize,
      font,
      color: rgb(0.627, 0.062, 0.074),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedFilename}"`);
    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Backend downloadCertificate error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
