import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const formatTitleCase = (str) => {
  if (!str) return "Valued Student";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function POST(req) {
  try {
    const { email, participantName, grade } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    const name = formatTitleCase(participantName);
    const safeGrade = ["A++", "A+", "A"].includes(grade) ? grade : "A";

    // 1. Select correct Certificate PDF based on grade
    const gradeFileMap = {
      "A++": "CertificatefinalA++.pdf",
      "A+": "CertificatefinalA+.pdf",
      A: "CertificatefinalA.pdf",
    };

    const certificateFile = gradeFileMap[safeGrade] || "CertificatefinalA.pdf";
    let templatePath = path.join(process.cwd(), "public", certificateFile);

    // Fallback to generic certificate if grade-specific not found
    if (!fs.existsSync(templatePath)) {
      console.warn(
        `[EMAIL] Grade-specific certificate not found: ${certificateFile}, falling back to Certificatefinal.pdf`,
      );
      templatePath = path.join(process.cwd(), "public", "Certificatefinal.pdf");
    }

    // 2. Generate Personalized PDF from Template
    let pdfBuffer;
    if (fs.existsSync(templatePath)) {
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const page = pdfDoc.getPages()[0];
      const { width } = page.getSize();

      // Calculate font size & center positioning on the dashed line after "Mr. / Ms."
      let fontSize = 22;
      if (name.length > 25) fontSize = 18;
      if (name.length > 35) fontSize = 15;

      const mrMsEndX = 315; // Dashed line starts after "Mr. / Ms."
      const lineEndX = 610; // Dashed line ends
      const availableWidth = lineEndX - mrMsEndX;
      const textWidth = font.widthOfTextAtSize(name, fontSize);

      // Center name horizontally across the dashed line segment
      const x = mrMsEndX + Math.max(0, (availableWidth - textWidth) / 2);
      const y = 202; // Baseline sits cleanly on top of the dashed line

      page.drawText(name, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.627, 0.062, 0.074), // #a01013
      });

      const pdfBytes = await pdfDoc.save();
      pdfBuffer = Buffer.from(pdfBytes);
    }

    // SMTP Configuration from environment variables
    const host = process.env.SMTP_HOST || "webmail.jagranhindi.in";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = (
      process.env.SMTP_USER || "info@jagransanskarshala.com"
    ).trim();
    let pass = (process.env.SMTP_PASS || "Wh3FStH8ozWlMysv")
      .replace(/^your-/i, "")
      .replace(/\s+/g, "")
      .trim();
    const from =
      process.env.SMTP_FROM || `"Dainik Jagran Sanskarshala" <${user}>`;

    console.log(
      `[SMTP CONFIG] host=${host} port=${port} user=${user} passLength=${pass.length}`,
    );

    // Grade display text for email
    const gradeText = safeGrade;

    // High-quality HTML Email Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank You for Participating in Jagran Sanskarshala Survey 2026</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #a01013 0%, #c59b27 100%); padding: 35px 25px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500; }
        .content { padding: 35px 30px; line-height: 1.7; font-size: 15px; }
        .salutation { font-size: 18px; font-weight: 700; color: #a01013; margin-bottom: 15px; }
        .card { background: #fcf8ee; border: 1px solid #f3e8c8; border-radius: 14px; padding: 20px; margin: 25px 0; text-align: center; }
        .card h3 { margin: 0 0 8px 0; color: #a01013; font-size: 18px; }
        .card p { margin: 0; font-size: 13px; color: #64748b; }
        .grade-badge { display: inline-block; background: linear-gradient(135deg, #a01013, #c59b27); color: white; font-size: 22px; font-weight: 900; padding: 8px 20px; border-radius: 12px; margin: 10px 0; letter-spacing: 1px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.4); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="background: rgba(255,255,255,0.95); display: inline-block; padding: 10px 22px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            <img src="cid:jagranlogo" alt="Dainik Jagran Sanskarshala" style="max-height: 55px; width: auto; display: block;" />
          </div>
          <div class="badge" style="display: block; margin: 0 auto 10px auto; width: fit-content;">National Digital Conduct Survey 2026</div>
          <h1 style="margin-top: 5px;">Jagran Sanskarshala</h1>
          <p>Building Digital Consciousness & Values</p>
        </div>

        <div class="content">
          <div class="salutation">Dear ${name},</div>

          <p>Thank you for participating in <strong>India's Largest Student Digital Conduct Survey 2026</strong> organized by <strong>Dainik Jagran Sanskarshala</strong>.</p>

          <p>Your honest responses contribute directly to shaping national digital habit awareness programs across schools in India.</p>

          <div class="card">
            <h3>🎓 Your Digital Behaviour Grade</h3>
            <div class="grade-badge">${gradeText}</div>
            <p style="margin-top: 10px;">Based on your survey responses, you have been awarded Grade <strong>${gradeText}</strong> for your Digital Behaviour.</p>
          </div>

          <div class="card">
            <h3>📄 Official Participation Certificate Attached</h3>
            <p>Your official Certificate of Participation (Grade ${gradeText}) is attached to this email as a PDF file.</p>
          </div>

          <p>We encourage you to download, print, or share your certificate with pride!</p>

          <p style="margin-top: 30px;">Warm Regards,<br>
          <strong style="color: #a01013; font-size: 16px;">Team Dainik Jagran</strong><br>
          <span style="font-size: 13px; color: #64748b;">Jagran Sanskarshala Initiative</span></p>
        </div>

        <div class="footer">
          &copy; 2026 Dainik Jagran Sanskarshala. All rights reserved.<br>
          This is an automated confirmation email sent to ${email}.
        </div>
      </div>
    </body>
    </html>
    `;

    // Process PDF Certificate Attachment & Logo
    const attachments = [];
    let logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "logo.png",
        path: logoPath,
        cid: "jagranlogo",
      });
    }

    if (pdfBuffer) {
      attachments.push({
        filename: `Sanskarshala_Certificate_${name.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    // Try sending email with automatic SMTP fallback strategies
    // Strategy: Try modern TLS → SSLv3 ciphers (original working config) → port 587
    let emailSent = false;
    let messageId = null;
    let emailError = null;

    const smtpStrategies = [
      {
        // Strategy 1: Primary verified working host - webmail.jagranhindi.in:465
        name: `SSL ${host}:${port}`,
        config: {
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 20000,
        },
      },
      {
        // Strategy 2: Verified STARTTLS on webmail.jagranhindi.in (port 587)
        name: `STARTTLS ${host}:587`,
        config: {
          host,
          port: 587,
          secure: false,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 20000,
        },
      },
      {
        // Strategy 3: Direct hostname fallback
        name: "jagranhindi.in:465",
        config: {
          host: "jagranhindi.in",
          port: 465,
          secure: true,
          auth: { user, pass },
          tls: { rejectUnauthorized: false, ciphers: "SSLv3" },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 20000,
        },
      },
    ];

    for (const strategy of smtpStrategies) {
      try {
        console.log(`[SMTP] Trying strategy: ${strategy.name}...`);
        const transporter = nodemailer.createTransport(strategy.config);

        await transporter.verify();
        console.log(`[SMTP VERIFY OK] ${strategy.name}`);

        const info = await transporter.sendMail({
          from,
          to: email,
          subject: `🎓 Grade ${gradeText} - Official Certificate - Dainik Jagran Sanskarshala 2026`,
          html: htmlContent,
          attachments,
        });

        emailSent = true;
        messageId = info.messageId;
        console.log(
          `[EMAIL SUCCESS] Strategy: ${strategy.name} | MessageId: ${info.messageId} | To: ${email} (Grade: ${gradeText})`,
        );
        break; // Success - stop trying other strategies
      } catch (err) {
        console.warn(
          `[SMTP FAILED] Strategy: ${strategy.name} | Error: ${err.message}`,
        );
        emailError = err.message;
        // Continue to next strategy
      }
    }

    if (!emailSent) {
      console.warn(
        `[EMAIL ALL STRATEGIES FAILED] All SMTP strategies failed for ${email}. Last error: ${emailError}`,
      );
    }

    return NextResponse.json({
      success: true,
      emailSent,
      messageId,
      emailError: emailSent ? undefined : emailError,
      message: emailSent
        ? `Certificate (Grade ${gradeText}) & Thank You Email sent successfully to ${email}`
        : `Certificate generated for ${email}. Email delivery pending.`,
    });
  } catch (error) {
    console.error("Error in send-certificate API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}


