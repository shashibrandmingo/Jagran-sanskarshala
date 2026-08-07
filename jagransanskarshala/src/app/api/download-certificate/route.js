import { NextResponse } from "next/server";
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

/**
 * Grade-based certificate download.
 * Picks the correct certificate template based on grade (A++, A+, A).
 * Falls back to Certificatefinal.pdf if grade-specific file not found.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get("name") || "Valued Student";
    const name = formatTitleCase(rawName);
    const grade = searchParams.get("grade") || "A";

    // Determine which certificate template to use based on grade
    const gradeFileMap = {
      "A++": "CertificatefinalA++.pdf",
      "A+": "CertificatefinalA+.pdf",
      A: "CertificatefinalA.pdf",
    };

    const certificateFile = gradeFileMap[grade] || "CertificatefinalA.pdf";
    let templatePath = path.join(process.cwd(), "public", certificateFile);

    // Fallback to generic certificate if grade-specific not found
    if (!fs.existsSync(templatePath)) {
      console.warn(
        `[DOWNLOAD] Grade-specific certificate not found: ${certificateFile}, falling back to Certificatefinal.pdf`
      );
      templatePath = path.join(process.cwd(), "public", "Certificatefinal.pdf");
    }

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: "Certificate template file not found" },
        { status: 404 }
      );
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const page = pdfDoc.getPages()[0];

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

    const pdfBuffer = Buffer.from(pdfBytes);

    const sanitizedFilename = `Sanskarshala_Certificate_${name
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .replace(/\s+/g, "_")}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating certificate download:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate PDF" },
      { status: 500 }
    );
  }
}
