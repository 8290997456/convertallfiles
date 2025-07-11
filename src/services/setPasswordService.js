// src/services/setPasswordService.js
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function setPassword(filePath, password, fileType) {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return await lockPdf(filePath, password);
    case 'zip':
      return await lockZip(filePath, password);
    default:
      throw new Error(`❌ Cannot set password for ${fileType}`);
  }
}

async function lockPdf(filePath, password) {
  const outputPath = `${filePath}-locked.pdf`;
  const command = `gs -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile="${outputPath}" -dPDFSETTINGS=/default -dEncryptionR=3 -dKeyLength=128 -sOwnerPassword="${password}" -sUserPassword="${password}" "${filePath}"`;

  try {
    await execPromise(command);
    const lockedBytes = await fs.readFile(outputPath);
    await fs.unlink(outputPath);
    return lockedBytes;
  } catch (error) {
    throw new Error(`PDF lock failed: ${error.message}`);
  }
}

async function lockZip(filePath, password) {
  const fileDir = path.dirname(filePath);
  const tempDir = `${filePath}-temp`;

  try {
    // Step 1: Create temp folder and unzip original
    await fs.mkdir(tempDir, { recursive: true });
    await execPromise(`unzip -o "${filePath}" -d "${tempDir}"`);

    // Step 2: Create locked zip inside tempDir
    const outputZipName = "locked.zip";
    const outputZipPath = path.join(tempDir, outputZipName);

    // 🔐 Zip with password using relative path inside the folder
    await execPromise(`cd "${tempDir}" && zip -r -P "${password}" "${outputZipName}" .`);

    // Step 3: Read zip and clean up
    const lockedBytes = await fs.readFile(outputZipPath);
    await fs.rm(tempDir, { recursive: true, force: true });

    return lockedBytes;
  } catch (error) {
    throw new Error(`ZIP lock failed: ${error.message}`);
  }
}