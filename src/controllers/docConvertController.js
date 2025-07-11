// src/controllers/docConvertController.js
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import convertDocument from '../services/convertDocument.js';

const allowedFormats = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods', 'odp', 'txt', 'rtf'];

export const convertDocHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const format = (req.body.format || 'pdf').toLowerCase();
  const inputPath = req.file.path;
  const baseName = path.parse(req.file.originalname).name;

  if (!allowedFormats.includes(path.extname(req.file.originalname).toLowerCase().replace('.', ''))) {
    return res.status(400).json({ error: 'Unsupported input file format.' });
  }

  const outputDir = path.join('/tmp', 'uploads_processed');
  if (!fsSync.existsSync(outputDir)) {
    fsSync.mkdirSync(outputDir, { recursive: true });
  }

  let outputPath = null;

  try {
    outputPath = await convertDocument(inputPath, format, outputDir);
    const fileBuffer = await fs.readFile(outputPath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${baseName}.${format}"`,
    });

    res.send(fileBuffer);
  } catch (error) {
    console.error('Conversion failed:', error);
    res.status(500).json({ error: 'Document conversion failed' });
  } finally {
    try {
      await fs.unlink(inputPath);
    } catch (e) {
      console.warn('Failed to delete input file:', e);
    }

    if (outputPath) {
      try {
        await fs.unlink(outputPath);
      } catch (e) {
        console.warn('Failed to delete converted file:', e);
      }
    }
  }
};
