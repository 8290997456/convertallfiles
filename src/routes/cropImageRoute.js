import express from 'express';
import upload from '../middlewares/upload.js';
import { cropImageHandler } from '../controllers/cropImageController.js';

const router = express.Router();

router.post('/', upload.single('image'), cropImageHandler);

export default router;
