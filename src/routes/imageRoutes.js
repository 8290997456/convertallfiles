import express from 'express';
import upload from '../middlewares/upload.js';
import { compressImageHandler } from '../controllers/imageController.js';

const router = express.Router();

router.post('/', upload.single('image'), compressImageHandler);

export default router;
