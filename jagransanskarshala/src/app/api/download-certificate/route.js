import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "Valued Student";

    // Read the English template Certificate.pdf from public/ or src/assets/images/
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

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: "Certificate template file not found" },
        { status: 404 }
      );
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed classic calligraphy/bold font
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const page = pdfDoc.getPages()[0];
    const { width } = page.getSize();

    // Calculate font size & position on the श्री/सुश्री line
    let fontSize = 24;
    if (name.length > 25) fontSize = 20;
    if (name.length > 35) fontSize = 16;

    const textWidth = font.widthOfTextAtSize(name, fontSize);
    const lineCenter = 470;
    const x = lineCenter - textWidth / 2;
    const y = 260; // Baseline sits directly on top of the dashed line

    // Draw participant name in Dainik Jagran Crimson Red (#a01013)
    page.drawText(name, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.627, 0.062, 0.074), // #a01013
    });

    const pdfBytes = await pdfDoc.save();

    const fileName = `Sanskarshala_Certificate_${name.replace(/\s+/g, "_")}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF" },
      { status: 500 }
    );
  }
}
