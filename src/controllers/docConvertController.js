import fs from 'fs/promises';
import fsSync from 'fs'; // For existsSync & mkdirSync
import path from 'path';
import convertDocument from '../services/convertDocument.js';

export const convertDocHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const format = (req.body.format || 'pdf').toLowerCase();
  const inputPath = req.file.path;
  const baseName = path.parse(req.file.originalname).name;

  // ✅ Use safe temp dir on Render
  const outputDir = path.join('/tmp', 'uploads_processed');

  // ✅ Ensure directory exists
  if (!fsSync.existsSync(outputDir)) {
    fsSync.mkdirSync(outputDir, { recursive: true });
  }

  let outputPath = null;

  try {
    // ✅ Convert the document
    outputPath = await convertDocument(inputPath, format, outputDir);

    const fileBuffer = await fs.readFile(outputPath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${baseName}.${format}"`,
    });

    res.send(fileBuffer);
  } catch (error) {
    console.error('❌ Doc conversion error:', error);
    return res.status(500).json({ error: 'Document conversion failed' });
  } finally {
    // ✅ Cleanup: delete input & output files
    try {
      await fs.unlink(inputPath);
    } catch (e) {
      console.warn('⚠️ Failed to delete input file:', e);
    }

    if (outputPath) {
      try {
        await fs.unlink(outputPath);
      } catch (e) {
        console.warn('⚠️ Failed to delete converted file:', e);
      }
    }
  }
};
