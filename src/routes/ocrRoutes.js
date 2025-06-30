// src /routes / orcRoute.js 
import express from 'express';
import upload from '../middlewares/upload.js';
import { imageToWordHandler, imageToExcelHandler, pdfToImageHandler, pdfToExcelHandler, pdfToWordHandler } from '../controllers/ocrController.js';

const router = express.Router();

router.post('/image-to-word', upload.single('image'), imageToWordHandler);
router.post('/image-to-excel', upload.single('image'), imageToExcelHandler);
router.post('/pdf-to-image', upload.single('image'), pdfToImageHandler);
router.post('/pdf-to-excel', upload.single('image'), pdfToExcelHandler);
router.post('/pdf-to-word', upload.single('image'), pdfToWordHandler)

export default router;
