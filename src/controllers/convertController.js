// src > controller >convertController.js
import fs from 'fs/promises';
import fsSync from 'fs'; // for fs.existsSync
import path from 'path';
import convertImage from '../services/convert.js';

export const convertImageHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const format =
    req.body.format || path.extname(req.file.originalname).replace('.', '');
  const inputPath = req.file.path;
  const baseName = path.parse(req.file.originalname).name;
  const newExt = format === 'jpg' ? 'jpeg' : format.toLowerCase();

  // ✅ Use safe folder for Render
  const outputDir = path.join('/tmp', 'uploads_processed');

  // ✅ Make sure the folder exists
  if (!fsSync.existsSync(outputDir)) {
    fsSync.mkdirSync(outputDir, { recursive: true });
  }

  // ✅ Full output path with timestamp
  const outputPath = path.join(
    outputDir,
    `${Date.now()}-${baseName}.${newExt}`
  );

  try {
    // 🔧 Convert the image
    await convertImage(inputPath, format, outputPath);

    // 📥 Read converted image
    const result = await fs.readFile(outputPath);

    // 📤 Send image to user
    res.set({
      'Content-Type': `image/${newExt}`,
      'Content-Disposition': `attachment; filename="${baseName}.${newExt}"`,
    });
    res.send(result);

    // 🧹 Clean up files
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);
  } catch (error) {
    console.error('❌ Conversion Error:', error);
    res.status(500).json({ error: 'Image conversion failed' });
  }
};
