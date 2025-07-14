// src / controllers /passwordController.js 
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileTypeFromFile } from 'file-type';
import { removePassword } from '../services/removePasswordService.js';
import { setPassword } from '../services/setPasswordService.js';

export const unlockPasswordHandler = async (req, res) => {
  const { password } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // 📂 Detect file type (by magic bytes)
    const fileType = await fileTypeFromFile(file.path);
    if (!fileType) throw new Error('Unsupported file type');

    const allowedTypes = ['pdf','zip'];
    if (!allowedTypes.includes(fileType.ext)) {
      throw new Error('Unsupported file type.');
    }

    // 🔐 Unlock the document
    const unlockedBytes = await removePassword(
      file.path,
      password,
      fileType.ext
    );

    // 📦 Detect Content-Type
    let contentType = 'application/octet-stream';
    const outputFilename = `locked-${Date.now()}.${fileType.ext}`;
    switch (fileType.ext) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'zip':
        contentType = 'application/zip';
        break;
    }
    // ✅ Send file as buffer (no temp file written)
    res.set({
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Type': contentType,
    });

    res.send(Buffer.from(unlockedBytes));
  } catch (error) {
    if (error.message.includes('Incorrect password')) {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error unlocking document:', error.message);
    res.status(500).json({
      error: 'Failed to remove password. Wrong password or unsupported file.',
    });
  } finally {
    // 🧹 Always delete the uploaded file
    try {
      await fs.unlink(file.path);
    } catch (e) {
      console.warn('⚠️ Could not delete uploaded file:', e.message);
    }
  }
};
// 
export const lockPasswordHandler = async (req, res) => {
  const { password } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const fileType = await fileTypeFromFile(file.path);
    if (!fileType) throw new Error('Unsupported file type.');

    const allowedTypes = ['pdf', 'zip'];
    if (!allowedTypes.includes(fileType.ext)) {
      throw new Error('Only PDF and ZIP password protection is supported.');
    }

    const lockedBytes = await setPassword(file.path, password, fileType.ext);

    const outputFilename = `locked-${Date.now()}.${fileType.ext}`;
    let contentType = 'application/octet-stream';

    switch (fileType.ext) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'zip':
        contentType = 'application/zip';
        break;
    }

    res.set({
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Type': contentType,
    });

    res.send(Buffer.from(lockedBytes));
  } catch (error) {
    console.error('Error locking document:', error.message);
    res.status(500).json({
      error: 'Failed to lock file. Please try again.',
    });
  } finally {
    try {
      await fs.unlink(file.path);
    } catch (e) {
      console.warn('Could not delete uploaded file:', e.message);
    }
  }
};

