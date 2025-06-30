// src > services > convert.js
import sharp from 'sharp';
import fs from 'fs/promises';

export default async function convertImage(inputPath, format, outputPath) {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

  const cleanFormat = format.replace('.', '').toLowerCase();
  if (!supportedFormats.includes(cleanFormat)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  const finalFormat = cleanFormat === 'jpg' ? 'jpeg' : cleanFormat;

  const buffer = await sharp(inputPath)
    .toFormat(finalFormat)
    .toBuffer();

  await fs.writeFile(outputPath, buffer);
}
