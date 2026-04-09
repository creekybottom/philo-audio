import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEpisodeScript } from '../utils/anthropic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const scriptsDir = path.join(__dirname, '..', '..', 'output', 'scripts');
const seriesPath = path.join(__dirname, '..', '..', 'output', 'series.json');

// GET /api/scripts/:episodeNumber — load a saved script
router.get('/:episodeNumber', (req, res) => {
  try {
    const num = String(req.params.episodeNumber).padStart(2, '0');
    const scriptPath = path.join(scriptsDir, `episode-${num}.json`);

    if (fs.existsSync(scriptPath)) {
      const data = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
      return res.json(data);
    }
    return res.json(null);
  } catch (err) {
    console.error('Error loading script:', err);
    return res.status(500).json({ error: 'Failed to load script' });
  }
});

// POST /api/scripts/:episodeNumber/generate — generate a script for an episode
router.post('/:episodeNumber/generate', async (req, res) => {
  try {
    const episodeNumber = parseInt(req.params.episodeNumber, 10);

    // Load series data
    if (!fs.existsSync(seriesPath)) {
      return res.status(400).json({ error: 'Series not found. Please create a series first.' });
    }
    const series = JSON.parse(fs.readFileSync(seriesPath, 'utf-8'));
    const episode = series.episodes.find(e => e.number === episodeNumber);
    if (!episode) {
      return res.status(404).json({ error: `Episode ${episodeNumber} not found in series` });
    }

    // Get previous episodes for context
    const previousEpisodes = series.episodes.filter(e => e.number < episodeNumber);

    const scriptText = await generateEpisodeScript(episode, previousEpisodes);
    const wordCount = scriptText.split(/\s+/).length;

    const scriptData = {
      episodeNumber,
      title: episode.title,
      script: scriptText,
      generated_at: new Date().toISOString(),
      word_count: wordCount,
    };

    // Auto-save the generated script
    const num = String(episodeNumber).padStart(2, '0');
    const scriptPath = path.join(scriptsDir, `episode-${num}.json`);
    fs.writeFileSync(scriptPath, JSON.stringify(scriptData, null, 2));

    return res.json(scriptData);
  } catch (err) {
    console.error('Error generating script:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate script' });
  }
});

// POST /api/scripts/:episodeNumber/save — save an edited script
router.post('/:episodeNumber/save', (req, res) => {
  try {
    const episodeNumber = parseInt(req.params.episodeNumber, 10);
    const { script, title } = req.body;

    const wordCount = script.split(/\s+/).length;
    const num = String(episodeNumber).padStart(2, '0');
    const scriptPath = path.join(scriptsDir, `episode-${num}.json`);

    const scriptData = {
      episodeNumber,
      title: title || `Episode ${episodeNumber}`,
      script,
      generated_at: new Date().toISOString(),
      word_count: wordCount,
    };

    fs.writeFileSync(scriptPath, JSON.stringify(scriptData, null, 2));
    return res.json(scriptData);
  } catch (err) {
    console.error('Error saving script:', err);
    return res.status(500).json({ error: 'Failed to save script' });
  }
});

// GET /api/scripts — list all saved scripts (for status checking)
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(scriptsDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.json'));
    const scripts = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(scriptsDir, f), 'utf-8'));
      return {
        episodeNumber: data.episodeNumber,
        title: data.title,
        word_count: data.word_count,
        generated_at: data.generated_at,
      };
    });
    return res.json(scripts);
  } catch (err) {
    console.error('Error listing scripts:', err);
    return res.status(500).json({ error: 'Failed to list scripts' });
  }
});

export default router;
