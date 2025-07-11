// src / services/removePasswordService.js 

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * 🔓 Master unlock service for PDF, DOCX/XLSX, and ZIP
 * @param {string} filePath - Full path of uploaded file
 * @param {string} password - Password to unlock
 * @param {string} fileType - File extension (pdf, docx, xlsx, zip)
 * @returns {Promise<Buffer>} - Unlocked file bytes
 */
export async function removePassword(filePath, password = '', fileType) {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return await removePdfPassword(filePath, password);
    case 'zip':
      return await removeZipPassword(filePath, password);

    default:
      throw new Error(`❌ Unsupported file type: ${fileType}`);
  }
}

/**
 * 🗂 Unlock PDF using LibreOffice
 */
async function removePdfPassword(filePath, password = '') {
  const outputPath = `${filePath}-unlocked.pdf`;
  const command = `gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile="${outputPath}" -sPDFPassword=${password} "${filePath}"`;

  try {
    await execPromise(command);
    const unlockedBytes = await fs.readFile(outputPath);
    await fs.unlink(outputPath);
    return unlockedBytes;
  } catch (error) {
    throw new Error(`PDF unlock via Ghostscript failed: ${error.message}`);
  }
}

/**
 * 🗜 Unlock ZIP files using CLI
 */
async function removeZipPassword(filePath, password = '') {
  try {
    const outputDir = `${filePath}-unzipped-${Date.now()}`;
    const outputZip = `${filePath}-unlocked.zip`;

    // Step 1: Unzip with password
    await fs.mkdir(outputDir, { recursive: true });
    await execPromise(`unzip -P "${password}" "${filePath}" -d "${outputDir}"`);

    // Step 2: Rezip without password
    await execPromise(`cd "${outputDir}" && zip -r "${outputZip}" .`);

    // Step 3: Read & cleanup
    const unlockedBytes = await fs.readFile(outputZip);
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.unlink(outputZip);

    return unlockedBytes;

  } catch (error) {
    if (error.message.toLowerCase().includes('incorrect password')) {
      throw new Error("❌ Incorrect ZIP password.");
    }
    throw new Error(`ZIP unlock failed: ${error.message}`);
  }
}
