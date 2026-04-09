# Little Thinkers — AI-Powered Philosophy Podcast Generator for Kids

A web app that generates, edits, and converts to audio a 12-episode philosophy podcast series for kids aged 7-9, using Claude for script writing and ElevenLabs for text-to-speech.

## Prerequisites

- **Node.js 18+**
- **ffmpeg** (for concatenating audio chunks)
- **Anthropic API key** — [get one here](https://console.anthropic.com/)
- **ElevenLabs API key** — [get one here](https://elevenlabs.io/)

## Setup

```bash
# Clone the repo and install dependencies
npm install
cd client && npm install && cd ..

# Configure API keys
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and ELEVENLABS_API_KEY

# Start development server
npm run dev
# Opens at http://localhost:5173, API at http://localhost:3001
```

## How to Use

1. **Series Planner** — Generate a 12-episode outline with Claude. Edit titles/descriptions, then approve.
2. **Dashboard** — See all episodes with status badges (Planned → Script Ready → Audio Ready). Click any episode to work on it.
3. **Script Editor** — Generate a full episode script with Claude, edit it, and save.
4. **Audio Generator** — Pick a voice and generate an MP3 with ElevenLabs. Listen inline or download.
