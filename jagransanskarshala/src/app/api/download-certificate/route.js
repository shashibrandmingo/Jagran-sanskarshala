import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "Valued Student";

    // 1. Locate Certificate Template in public folder
    let templatePath = path.join(
      process.cwd(),
      "public",
      "Certificatefinal.pdf"
    );

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

    // Calculate font size & positioning
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
