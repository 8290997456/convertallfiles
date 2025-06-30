import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import {
  extractTextFromImage,
  textToWordFile,
  textToExcelFile,
} from '../services/imageToDoc.js';
import {
  extractTextFromPdf,
  convertPdfToImages,
} from '../services/pdfService.js';

// ✅ temp output dir
const OUTPUT_DIR = path.join('/tmp', 'uploads_processed');

// ✅ ensure output dir exists
if (!fsSync.existsSync(OUTPUT_DIR)) {
  fsSync.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ✅ 1. Image ➡ Word
export const imageToWordHandler = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const text = await extractTextFromImage(req.file.path);
  const filePath = await textToWordFile(
    text,
    req.file.originalname,
    OUTPUT_DIR
  );

  const buffer = await fs.readFile(filePath);
  res.set({
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
  });
  res.send(buffer);

  await fs.unlink(req.file.path);
  await fs.unlink(filePath);
};

// ✅ 2. Image ➡ Excel
export const imageToExcelHandler = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const text = await extractTextFromImage(req.file.path);
  const filePath = await textToExcelFile(
    text,
    req.file.originalname,
    OUTPUT_DIR
  );

  const buffer = await fs.readFile(filePath);
  res.set({
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
  });
  res.send(buffer);

  await fs.unlink(req.file.path);
  await fs.unlink(filePath);
};

// ✅ 3. PDF ➡ Images (base64 array)
export const pdfToImageHandler = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const images = await convertPdfToImages(req.file.path); // ⬅️ assumes base64 array return
  res.json({ images });

  await fs.unlink(req.file.path);
};

// ✅ 4. PDF ➡ Excel
export const pdfToExcelHandler = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const text = await extractTextFromPdf(req.file.path);
  const filePath = await textToExcelFile(
    text,
    req.file.originalname,
    OUTPUT_DIR
  );

  const buffer = await fs.readFile(filePath);
  res.set({
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
  });
  res.send(buffer);

  await fs.unlink(req.file.path);
  await fs.unlink(filePath);
};

// ✅ 5. PDF ➡ Word
export const pdfToWordHandler = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const text = await extractTextFromPdf(req.file.path);
  const filePath = await textToWordFile(
    text,
    req.file.originalname,
    OUTPUT_DIR
  );

  const buffer = await fs.readFile(filePath);
  res.set({
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
  });
  res.send(buffer);

  await fs.unlink(req.file.path);
  await fs.unlink(filePath);
};
