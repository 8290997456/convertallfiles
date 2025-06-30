// src > routes >removePasswordRoute.js 
import express from 'express';
import upload from '../middlewares/upload.js';
import { removePasswordHandler } from '../controllers/removePasswordController.js';

const router = express.Router();

router.post('/', upload.single('image'), removePasswordHandler);

export default router;
