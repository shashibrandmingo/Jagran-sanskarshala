import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req) {
  try {
    const { email, participantName } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const name = participantName || "Valued Student";

    // 1. Generate Personalized PDF from Template (using English Certificate.pdf)
    let templatePath = path.join(process.cwd(), "public", "Certificate.pdf");
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(
        process.cwd(),
        "src",
        "assets",
        "images",
        "Certificate.pdf"
      );
    }

    let pdfBuffer;
    if (fs.existsSync(templatePath)) {
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const page = pdfDoc.getPages()[0];
      const { width } = page.getSize();

      let fontSize = 24;
      if (name.length > 25) fontSize = 20;
      if (name.length > 35) fontSize = 16;

      const textWidth = font.widthOfTextAtSize(name, fontSize);
      const lineCenter = 470;
      const x = lineCenter - textWidth / 2;
      const y = 260; // Baseline sits directly on top of the dashed line

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

    // SMTP Configuration from environment variables (with active fallback)
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = (process.env.SMTP_USER || "pradeepgaur1825@gmail.com").trim();
    let pass = (process.env.SMTP_PASS || "cmpyanjzpeillmwi").replace(/^your-/i, "").replace(/\s+/g, "").trim();
    const from = process.env.SMTP_FROM || `"Dainik Jagran Sanskarshala" <${user}>`;

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
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.4); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">National Digital Conduct Survey 2026</div>
          <h1>Jagran Sanskarshala</h1>
          <p>Building Digital Consciousness & Values</p>
        </div>
        
        <div class="content">
          <div class="salutation">Dear ${name},</div>
          
          <p>Thank you for participating in <strong>India's Largest Student Digital Conduct Survey 2026</strong> organized by <strong>Dainik Jagran Sanskarshala</strong>.</p>
          
          <p>Your honest responses contribute directly to shaping national digital habit awareness programs across schools in India.</p>

          <div class="card">
            <h3>🎓 Official Participation Certificate Attached</h3>
            <p>Your official Certificate of Participation is attached to this email as a PDF file (${name.replace(/\s+/g, '_')}_Certificate.pdf).</p>
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

    // Process PDF Certificate Attachment
    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Sanskarshala_Certificate_${name.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    // Live Transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true, // port 465 SSL
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `🎓 Official Participation Certificate - Dainik Jagran Sanskarshala 2026`,
      html: htmlContent,
      attachments,
    });

    console.log(`[EMAIL DISPATCH SUCCESS] MessageId: ${info.messageId} to ${email}`);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Certificate & Thank You Email sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("Error sending certificate email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
