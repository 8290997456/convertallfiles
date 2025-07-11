// src > routes >converRoute.js 
import express from 'express';
import upload from '../middlewares/upload.js';
import { convertImageHandler,convertWpsHandler} from '../controllers/convertController.js';

const router = express.Router();

router.post('/', upload.single('image'), convertImageHandler);
router.post('/wps', upload.single('file'), convertWpsHandler);

export default router;



