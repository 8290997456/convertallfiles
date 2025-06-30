import fs from 'fs';
import path from 'path';
import cropImageService from '../services/cropImageService.js';

export const cropImageHandler = async (req, res) => {
  try {
    const { width, height, format, transparent } = req.body;

    const widthInt = parseInt(width);
    const heightInt = parseInt(height);

    if (isNaN(widthInt) || isNaN(heightInt)) {
      return res.status(400).json({ message: 'Invalid dimensions' });
    }

    const inputPath = req.file.path;

    const ext = format?.includes('avif')
      ? 'avif'
      : format?.includes('png')
      ? 'png'
      : format?.includes('webp')
      ? 'webp'
      : 'jpeg';

    const timestamp = Date.now();

    // ✅ Use /tmp/uploads_processed on Render
    const outputDir = path.join('/tmp', 'uploads_processed');

    // ✅ Ensure folder exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `resized-${timestamp}.${ext}`);

    // ✅ Crop / resize image
    await cropImageService({
      inputPath,
      outputPath,
      width: widthInt,
      height: heightInt,
      ext,
      transparent,
    });

    // ✅ Read file as base64
    const imageBuffer = fs.readFileSync(outputPath);
    const base64 = `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
    const sizeKB = Math.round(imageBuffer.length / 1024);

    // ✅ Clean up temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    // ✅ Send result
    res.json({ base64, size: sizeKB, format: ext });
  } catch (err) {
    console.error('❌ Error in cropImageHandler:', err);
    res.status(500).json({ message: 'Image processing failed' });
  }
};
