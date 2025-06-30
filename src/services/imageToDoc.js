import Tesseract from 'tesseract.js';
import { Document, Packer, Paragraph } from 'docx';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';

export async function extractTextFromImage(imagePath) {
  const result = await Tesseract.recognize(imagePath, 'eng');
  return result.data.text;
}

export async function textToWordFile(text, originalName) {
  const doc = new Document({
    sections: [{ children: [new Paragraph(text)] }],
  });

  const filename = `uploads_processed/${Date.now()}-${path.parse(originalName).name}.docx`;
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(filename, buffer);
  return filename;
}

export async function textToExcelFile(text, originalName) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Extracted Data');

  const lines = text.split('\n');
  lines.forEach((line, index) => {
    sheet.addRow([line.trim()]);
  });

  const filename = `uploads_processed/${Date.now()}-${path.parse(originalName).name}.xlsx`;
  await workbook.xlsx.writeFile(filename);
  return filename;
}
