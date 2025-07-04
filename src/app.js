// src > app.js
import express from 'express';
import cors from 'cors';
import imageRoutes from './routes/imageRoutes.js';
import convertRoutes from './routes/convertRoute.js';
import docConvertRoutes from './routes/docConvertRoute.js';
import removePasswordRoutes from './routes/removePasswordRoute.js';
import cropImageRoute from './routes/cropImageRoute.js';
import ocrRoutes from './routes/ocrRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/ping', (req, res) => {
  res.status(200).send('Pong');
});

app.use('/remove-password', removePasswordRoutes);
app.use('/file-convert', docConvertRoutes);
app.use('/convert', convertRoutes);
app.use('/compress', imageRoutes);
app.use('/crop-image', cropImageRoute);
app.use('/ocr', ocrRoutes);

export default app;
