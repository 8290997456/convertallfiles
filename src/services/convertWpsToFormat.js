// src/services/convertWpsToFormat.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export default async function convertWpsToFormat(inputPath, outputPath, format = 'docx') {
  const allowedFormats = ['docx', 'doc', 'pdf'];
  if (!allowedFormats.includes(format)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  const outputDir = path.dirname(outputPath);
  const command = `libreoffice --headless --convert-to ${format} "${inputPath}" --outdir "${outputDir}"`;

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stderr.toLowerCase().includes("error")) {
      throw new Error(stderr);
    }

    const baseName = path.basename(inputPath, path.extname(inputPath));
    const generatedPath = path.join(outputDir, `${baseName}.${format}`);

    await fs.rename(generatedPath, outputPath);
  } catch (err) {
    console.error("LibreOffice conversion error:", err);
    throw err;
  }
}
