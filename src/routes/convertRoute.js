// src > routes >converRoute.js 
import express from 'express';
import upload from '../middlewares/upload.js';
import { convertImageHandler } from '../controllers/convertController.js';

const router = express.Router();

router.post('/', upload.single('image'), convertImageHandler);

export default router;



