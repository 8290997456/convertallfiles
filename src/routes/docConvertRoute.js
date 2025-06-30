import express from 'express';
import upload from '../middlewares/upload.js';
import { convertDocHandler } from '../controllers/docConvertController.js';

const router = express.Router();

router.post('/', upload.single('image'), convertDocHandler);

export default router;
