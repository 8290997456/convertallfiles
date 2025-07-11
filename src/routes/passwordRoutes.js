// src > routes >passwordRoutes.js 
import express from 'express';
import upload from '../middlewares/upload.js';
import { unlockPasswordHandler,lockPasswordHandler } from '../controllers/passwordController.js';

const router = express.Router();

router.post('/unlock', upload.single('image'), unlockPasswordHandler);
router.post('/lock', upload.single('image'), lockPasswordHandler);

export default router;
