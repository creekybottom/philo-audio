import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import seriesRoutes from './routes/series.js';
import scriptsRoutes from './routes/scripts.js';
import audioRoutes from './routes/audio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Validate environment variables
const missingKeys = [];
if (!process.env.ANTHROPIC_API_KEY) missingKeys.push('ANTHROPIC_API_KEY');
if (!process.env.ELEVENLABS_API_KEY) missingKeys.push('ELEVENLABS_API_KEY');
if (missingKeys.length > 0) {
  console.error(`\n❌ Missing required environment variables: ${missingKeys.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in your API keys.\n');
}

// Create output directories
const outputDir = path.join(__dirname, '..', 'output');
const dirs = [outputDir, path.join(outputDir, 'scripts'), path.join(outputDir, 'audio')];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve audio files statically
app.use('/output/audio', express.static(path.join(outputDir, 'audio')));

// API routes
app.use('/api/series', seriesRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/audio', audioRoutes);

app.listen(PORT, () => {
  console.log(`\n🧠 Little Thinkers server running at http://localhost:${PORT}`);
  if (missingKeys.length > 0) {
    console.log('⚠️  Some API keys are missing — generation features will not work.');
  }
});
