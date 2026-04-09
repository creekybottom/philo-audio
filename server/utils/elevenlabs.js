import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, warm female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, friendly female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Warm, engaging male voice' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Deep, clear male voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Clear, professional male voice' },
];

const CHUNK_SIZE = 5000;

function getApiKey() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not set in environment variables');
  }
  return process.env.ELEVENLABS_API_KEY;
}

function chunkText(text) {
  if (text.length <= CHUNK_SIZE) {
    return [text];
  }

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining);
      break;
    }

    // Find a good break point (end of sentence) within the chunk size
    let breakPoint = remaining.lastIndexOf('. ', CHUNK_SIZE);
    if (breakPoint === -1 || breakPoint < CHUNK_SIZE * 0.5) {
      breakPoint = remaining.lastIndexOf(' ', CHUNK_SIZE);
    }
    if (breakPoint === -1) {
      breakPoint = CHUNK_SIZE;
    } else {
      breakPoint += 1; // Include the space/period
    }

    chunks.push(remaining.substring(0, breakPoint));
    remaining = remaining.substring(breakPoint).trim();
  }

  return chunks;
}

async function generateChunkAudio(text, voiceId) {
  const apiKey = getApiKey();

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.75,
        style: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function concatenateMp3Files(chunkPaths, outputPath) {
  // Create a concat list file for ffmpeg
  const listPath = outputPath + '.concat.txt';
  const listContent = chunkPaths.map(p => `file '${p}'`).join('\n');
  fs.writeFileSync(listPath, listContent);

  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, {
      stdio: 'pipe',
    });
  } finally {
    // Clean up
    fs.unlinkSync(listPath);
    for (const chunkPath of chunkPaths) {
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    }
  }
}

export async function generateAudio(text, episodeNumber, voiceId, onProgress) {
  const outputDir = path.join(__dirname, '..', '..', 'output', 'audio');
  const outputPath = path.join(outputDir, `episode-${String(episodeNumber).padStart(2, '0')}.mp3`);

  const chunks = chunkText(text);
  const totalChunks = chunks.length;

  if (onProgress) onProgress({ phase: 'starting', totalChunks });

  if (totalChunks === 1) {
    // Single chunk — direct generation
    if (onProgress) onProgress({ phase: 'generating', chunk: 1, totalChunks });
    const audioBuffer = await generateChunkAudio(chunks[0], voiceId);
    fs.writeFileSync(outputPath, audioBuffer);
    if (onProgress) onProgress({ phase: 'complete', totalChunks });
    return outputPath;
  }

  // Multiple chunks — generate and concatenate
  const chunkPaths = [];

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress({ phase: 'generating', chunk: i + 1, totalChunks });
    console.log(`  Generating audio chunk ${i + 1}/${totalChunks} (${chunks[i].length} chars)`);

    const audioBuffer = await generateChunkAudio(chunks[i], voiceId);
    const chunkPath = path.join(outputDir, `episode-${String(episodeNumber).padStart(2, '0')}_chunk_${i}.mp3`);
    fs.writeFileSync(chunkPath, audioBuffer);
    chunkPaths.push(chunkPath);
  }

  if (onProgress) onProgress({ phase: 'concatenating', totalChunks });
  console.log(`  Concatenating ${totalChunks} chunks...`);
  concatenateMp3Files(chunkPaths, outputPath);

  if (onProgress) onProgress({ phase: 'complete', totalChunks });
  return outputPath;
}
