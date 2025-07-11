// src/services/convert.js
import sharp from 'sharp';
import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { trace } from 'potrace'; // ✅ install with: npm install potrace

export default async function convertImage(inputPath, format, outputPath) {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf', 'svg'];
  const cleanFormat = format.replace('.', '').toLowerCase();

  if (!supportedFormats.includes(cleanFormat)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  // ✅ Convert to PDF
  if (cleanFormat === 'pdf') {
    const imageBuffer = await sharp(inputPath).jpeg().toBuffer();
    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedJpg(imageBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    return;
  }

  // ✅ Convert to SVG using potrace (vectorize raster images)
  if (cleanFormat === 'svg') {
    return new Promise((resolve, reject) => {
      trace(inputPath, { color: 'black' }, async (err, svg) => {
        if (err) return reject(err);
        await fs.writeFile(outputPath, svg);
        resolve();
      });
    });
  }

  // ✅ All other formats handled by sharp
  const finalFormat = cleanFormat === 'jpg' ? 'jpeg' : cleanFormat;
  const outputBuffer = await sharp(inputPath).toFormat(finalFormat).toBuffer();
  await fs.writeFile(outputPath, outputBuffer);
}
