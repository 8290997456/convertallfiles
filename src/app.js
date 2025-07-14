import express from 'express';
import cors from 'cors';

import imageRoutes from './routes/imageRoutes.js';
import convertRoutes from './routes/convertRoute.js';
import docConvertRoutes from './routes/docConvertRoute.js';
import passwordRoutes from './routes/passwordRoutes.js';
import cropImageRoute from './routes/cropImageRoute.js';
import ocrRoutes from './routes/ocrRoutes.js';

const app = express();

// ✅ CORS Configuration for production
const corsOptions = {
  origin: 'https://convertallfiles.com', // your frontend URL
  methods: ['GET', 'POST'],
  credentials: true, // allow cookies, authorization headers, etc.
};

app.use(cors(corsOptions)); // 💥 CORS applied here

app.use(express.json());

// ✅ Health check
app.get('/api/ping', (req, res) => {
  res.status(200).send('Pong');
});

// ✅ Routes
app.use('/password', passwordRoutes);
app.use('/file-convert', docConvertRoutes);
app.use('/convert', convertRoutes);
app.use('/compress', imageRoutes);
app.use('/crop-image', cropImageRoute);
app.use('/ocr', ocrRoutes);

export default app;
