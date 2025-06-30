// src/controllers/removePasswordController.js
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileTypeFromFile } from 'file-type';
import { removePassword } from '../services/removePasswordService.js';

export const removePasswordHandler = async (req, res) => {
  const { password } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // 📂 Detect file type (by magic bytes)
    const fileType = await fileTypeFromFile(file.path);
    if (!fileType) throw new Error('Unsupported file type');

    // 🔐 Unlock the document
    const unlockedBytes = await removePassword(
      file.path,
      password,
      fileType.ext
    );

    // 📦 Detect Content-Type
    let contentType = 'application/octet-stream';
    let extension = fileType.ext;

    switch (extension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        contentType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xlsx':
        contentType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'zip':
        contentType = 'application/zip';
        break;
    }

    // ✅ Safe file naming
    const outputFilename = `unlocked-${Date.now()}.${extension}`;

    // ✅ Send file as buffer (no temp file written)
    res.set({
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Type': contentType,
    });

    res.send(Buffer.from(unlockedBytes));
  } catch (error) {
    console.error('❌ Error unlocking document:', error.message);
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
