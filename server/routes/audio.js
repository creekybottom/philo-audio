import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAudio, VOICES } from '../utils/elevenlabs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const scriptsDir = path.join(__dirname, '..', '..', 'output', 'scripts');
const audioDir = path.join(__dirname, '..', '..', 'output', 'audio');

// GET /api/audio/voices — list available voices
router.get('/voices', (req, res) => {
  res.json(VOICES);
});

// GET /api/audio/:episodeNumber/status — check if audio exists
router.get('/:episodeNumber/status', (req, res) => {
  const num = String(req.params.episodeNumber).padStart(2, '0');
  const audioPath = path.join(audioDir, `episode-${num}.mp3`);
  const exists = fs.existsSync(audioPath);
  res.json({
    exists,
    url: exists ? `/output/audio/episode-${num}.mp3` : null,
  });
});

// POST /api/audio/:episodeNumber/generate — generate audio for an episode
router.post('/:episodeNumber/generate', async (req, res) => {
  try {
    const episodeNumber = parseInt(req.params.episodeNumber, 10);
    const { voiceId } = req.body;
    const selectedVoice = voiceId || '21m00Tcm4TlvDq8ikWAM';

    // Load the script
    const num = String(episodeNumber).padStart(2, '0');
    const scriptPath = path.join(scriptsDir, `episode-${num}.json`);

    if (!fs.existsSync(scriptPath)) {
      return res.status(400).json({ error: 'Script not found. Generate a script first.' });
    }

    const scriptData = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));

    console.log(`🎙️  Generating audio for Episode ${episodeNumber}: "${scriptData.title}"`);
    console.log(`   Script length: ${scriptData.script.length} characters`);

    const outputPath = await generateAudio(
      scriptData.script,
      episodeNumber,
      selectedVoice,
      (progress) => {
        console.log(`   Progress: ${progress.phase} ${progress.chunk ? `(chunk ${progress.chunk}/${progress.totalChunks})` : ''}`);
      }
    );

    console.log(`✅ Audio saved to ${outputPath}`);

    return res.json({
      success: true,
      url: `/output/audio/episode-${num}.mp3`,
    });
  } catch (err) {
    console.error('Error generating audio:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate audio' });
  }
});

// GET /api/audio/:episodeNumber/download — download the MP3 file
router.get('/:episodeNumber/download', (req, res) => {
  const num = String(req.params.episodeNumber).padStart(2, '0');
  const audioPath = path.join(audioDir, `episode-${num}.mp3`);

  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  res.download(audioPath, `little-thinkers-episode-${num}.mp3`);
});

// GET /api/audio/status — check audio status for all episodes
router.get('/status/all', (req, res) => {
  try {
    if (!fs.existsSync(audioDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') && !f.includes('_chunk_'));
    const statuses = files.map(f => {
      const match = f.match(/episode-(\d+)\.mp3/);
      return match ? parseInt(match[1], 10) : null;
    }).filter(Boolean);
    return res.json(statuses);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to check audio status' });
  }
});

export default router;
