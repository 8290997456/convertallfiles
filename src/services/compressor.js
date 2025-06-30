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
    default:
      throw new Error('Unsupported format');
  }

  fs.writeFileSync(outputPath, buffer);
}

