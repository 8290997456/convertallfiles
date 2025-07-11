// src > controller >convertController.js
import fs from 'fs/promises';
import fsSync from 'fs'; // for fs.existsSync
import path from 'path';
import convertImage from '../services/convert.js';
import convertWpsToFormat from '../services/convertWpsToFormat.js';

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

export const convertWpsHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const baseName = path.parse(req.file.originalname).name;
  const outputFormat = req.query.to || 'docx';

  const outputDir = path.join('/tmp', 'uploads_processed');
  if (!fsSync.existsSync(outputDir)) {
    fsSync.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${Date.now()}-${baseName}.${outputFormat}`);

  try {
    await convertWpsToFormat(inputPath, outputPath, outputFormat);

    const fileBuffer = await fs.readFile(outputPath);
    const mimeTypes = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      pdf: 'application/pdf'
    };
    res.set({
      'Content-Type': mimeTypes[outputFormat] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${baseName}.${outputFormat}"`,
    });
    res.send(fileBuffer);

    await fs.unlink(inputPath);
    await fs.unlink(outputPath);
  } catch (err) {
    console.error("WPS Conversion Failed:", err);
    res.status(500).json({ error: 'WPS to Word conversion failed' });
  }
};



