// src/middlewares/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ✅ Use /tmp/uploads/ on Render
const UPLOAD_DIR = path.join('/tmp', 'uploads');

// ✅ Ensure folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR); // ✅ Safe folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export default multer({ storage });
