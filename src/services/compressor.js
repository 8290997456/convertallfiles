import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';
import imageminWebp from 'imagemin-webp';
import imageminSvgo from 'imagemin-svgo'; 
import sharp from 'sharp';
import fs from 'fs';

export default async function compressImage(inputPath, ext, outputPath) {
  let buffer = fs.readFileSync(inputPath);

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      buffer = await imagemin.buffer(buffer, {
        plugins: [imageminMozjpeg({ quality: 70 })],
      });
      break;

    case '.png':
      buffer = await imagemin.buffer(buffer, {
        plugins: [imageminOptipng({ optimizationLevel: 3 })],
      });
      break;

    case '.webp':
      buffer = await imagemin.buffer(buffer, {
        plugins: [imageminWebp({ quality: 60 })],
      });
      break;

    case '.avif':
      buffer = await sharp(buffer).avif({ quality: 50 }).toBuffer();
      break;

    case '.svg':
      buffer = await imagemin.buffer(buffer, {
        plugins: [imageminSvgo()],
      });
      break;

    case '.pdf':
      // Convert image buffer to PDF
      buffer = await sharp(buffer)
        .resize({ fit: "contain", width: 1240 }) // optional: resize for A4 width
        .jpeg() // convert to JPEG internally
        .toBuffer();

      const pdfBuffer = await sharp(buffer)
        .resize({ fit: 'inside' }) // keep proportions
        .pdf({ quality: 80 })
        .toBuffer();

      fs.writeFileSync(outputPath, pdfBuffer);
      return; // already written, so exit early

    default:
      throw new Error('Unsupported format');
  }

  fs.writeFileSync(outputPath, buffer);
}
