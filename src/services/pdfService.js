import fs from 'fs/promises';
import { fromPath } from 'pdf2pic';
import fsExtra from 'fs-extra';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js'; // legacy build is for Node.js

/**
 * Extract text using PDF.js first, fallback to OCR if empty
 */
export async function extractTextFromPdf(filePath) {
  try {
    const text = await extractTextWithPdfjs(filePath);
    if (!text || text.trim() === '') throw new Error('No text found');
    return text;
  } catch (err) {
    console.warn('⚠️ Falling back to OCR...');
    return await extractTextWithOcr(filePath);
  }
}

/**
 * Extract text using pdfjs-dist (PDF.js)
 */
async function extractTextWithPdfjs(filePath) {
  const data = await fs.readFile(filePath);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str).join(' ');
    fullText += strings + '\n';
  }

  return fullText.trim();
}

/**
 * Fallback: OCR using Tesseract.js on each page image
 */
export async function extractTextWithOcr(filePath) {
  try {
    const images = await convertPdfToImages(filePath);

    let fullText = '';
    for (const imagePath of images) {
      console.log(`🔍 Running OCR on: ${imagePath}`);
      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`)
      });
      fullText += result.data.text.trim() + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('❌ OCR failed:', error.message || error);
    throw new Error('Both PDF.js and OCR failed to extract text.');
  }
}

/**
 * Convert PDF pages to PNG images using pdf2pic
 */
export async function convertPdfToImages(filePath) {
  try {
    const outputDir = './uploads_processed';
    await fsExtra.ensureDir(outputDir);

    const options = {
      density: 100,
      saveFilename: `converted_${Date.now()}`,
      savePath: outputDir,
      format: 'png',
      width: 800,
      height: 1000,
    };

    const storeAsImage = fromPath(filePath, options);
    const imagePaths = [];

    const data = await fs.readFile(filePath);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    const totalPages = pdfDocument.numPages;

    for (let i = 1; i <= totalPages; i++) {
      const output = await storeAsImage(i);
      imagePaths.push(output.path);
    }

    return imagePaths;
  } catch (error) {
    console.error('❌ Error converting PDF to images:', error.message || error);
    throw error;
  }
}
