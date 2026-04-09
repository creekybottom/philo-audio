import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSeriesOutline } from '../utils/anthropic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const seriesPath = path.join(__dirname, '..', '..', 'output', 'series.json');

// GET /api/series — load saved series or return null
router.get('/', (req, res) => {
  try {
    if (fs.existsSync(seriesPath)) {
      const data = JSON.parse(fs.readFileSync(seriesPath, 'utf-8'));
      return res.json(data);
    }
    return res.json(null);
  } catch (err) {
    console.error('Error loading series:', err);
    return res.status(500).json({ error: 'Failed to load series' });
  }
});

// POST /api/series/generate — generate a new series outline
router.post('/generate', async (req, res) => {
  try {
    const episodes = await generateSeriesOutline();
    return res.json({ episodes, approved: false });
  } catch (err) {
    console.error('Error generating series:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate series outline' });
  }
});

// POST /api/series/save — save/approve the series
router.post('/save', (req, res) => {
  try {
    const { episodes, approved } = req.body;
    const data = {
      episodes,
      approved: approved !== false,
      created_at: new Date().toISOString(),
    };
    fs.writeFileSync(seriesPath, JSON.stringify(data, null, 2));
    return res.json(data);
  } catch (err) {
    console.error('Error saving series:', err);
    return res.status(500).json({ error: 'Failed to save series' });
  }
});

export default router;
