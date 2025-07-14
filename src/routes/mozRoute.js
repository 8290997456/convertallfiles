// routes/mozRoute.js
import express from 'express';
import { getMozData } from '../services/mozChecker.js';

const router = express.Router();

router.post('/moz-da-pa', async (req, res) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required.' });
  }

  try {
    const data = await getMozData(domain);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
