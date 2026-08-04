const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

async function checkPdf() {
  const templatePath = path.join(__dirname, "..", "public", "Certificatefinal.pdf");
  
  if (!fs.existsSync(templatePath)) {
    console.log("Certificatefinal.pdf NOT FOUND at:", templatePath);
    return;
  }
  
  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  
  console.log("=== Certificatefinal.pdf Dimensions ===");
  console.log("Width:", width);
  console.log("Height:", height);
  console.log("Pages:", pdfDoc.getPageCount());
  console.log("Aspect:", (width/height).toFixed(2));
  
  if (width > height) {
    console.log("Orientation: LANDSCAPE");
  } else {
    console.log("Orientation: PORTRAIT");
  }
}

checkPdf().catch(console.error);
