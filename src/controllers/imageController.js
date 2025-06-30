import fs from 'fs';
import path from 'path';
import compressImage from '../services/compressor.js';

export const compressImageHandler = async (req, res) => {
  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();

  // Safe folder for Render
  const outputDir = path.join('/tmp', 'uploads_processed');

  // Ensure the folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${Date.now()}${fileExt}`);

  try {
    // Compress image
    await compressImage(filePath, fileExt, outputPath);

    // Send compressed image
    const result = fs.readFileSync(outputPath);
    res.set('Content-Type', req.file.mimetype);
    res.send(result);

    // Cleanup files after send
    fs.unlink(outputPath, (err) => {
      if (err) console.error('Error deleting output file:', err);
    });

    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });
  } catch (error) {
    console.error('Compression Error:', error);
    res.status(500).json({ error: 'Compression failed' });
  }
};
