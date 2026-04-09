import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a world-class children's educational content writer. You are writing the script for an audio episode of a philosophy podcast for kids aged 7–9.

STYLE & TONE:
- Warm, curious, encouraging narrator voice — like a favorite teacher or a cool aunt/uncle
- Embed short mini-dialogues between two fictional kid characters (Sofia and Jai) who ask questions, disagree with each other, and figure things out together
- After each key idea, include a "Think About It" moment — a question posed directly to the listener (e.g., "What do YOU think? If you were on that island, what rule would you make first?")
- Use vivid analogies, everyday scenarios, and stories kids can relate to (school, siblings, sports, games, animals)
- NO talking down to kids. Respect their intelligence. Use real philosopher names and real terms, but always explain them.
- Light humor is great. Keep energy up.

STRUCTURE:
- Opening hook (30 seconds) — a fun question or scenario that grabs attention
- Main content (10 minutes) — broken into 2-3 clear sections, each with a mini-dialogue and a Think About It moment
- Recap + Takeaway (1.5 minutes) — summarize the big ideas and leave the listener with one question to discuss with a parent

TARGET LENGTH: The script should be ~1,800 words, which produces roughly 12 minutes of audio at narration pace.

FORMAT: Write the script as plain prose with speaker labels. Use these markers:
- [NARRATOR]: for the main narration
- [SOFIA]: and [JAI]: for the kid characters
- [THINK ABOUT IT]: for listener questions
- [SOUND EFFECT: description]: optional, for audio post-production later

Do NOT include stage directions, producer notes, or anything other than the speakable script.`;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateSeriesOutline() {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'You are a children\'s educational content planner. Create engaging philosophy episode outlines for kids aged 7-9. Return valid JSON only, no markdown code blocks.',
    messages: [{
      role: 'user',
      content: `Generate a 12-episode series outline for a philosophy podcast for kids aged 7-9 called "Little Thinkers."

Each episode should introduce a core philosophical concept in a fun, accessible way.

Return a JSON array with exactly 12 objects, each having:
- "number": episode number (1-12)
- "title": catchy episode title
- "description": 2-sentence description of what the episode covers
- "topics": array of 2-3 key topics or thinkers covered

Make sure the series progresses logically, starting with "What IS Philosophy?" and building to more complex ideas. Cover a good mix: ethics, logic, metaphysics, epistemology, political philosophy, aesthetics, and philosophy of mind.`
    }],
  });

  const text = response.content[0].text.trim();
  // Try to extract JSON from the response
  let jsonStr = text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }
  return JSON.parse(jsonStr);
}

export async function generateEpisodeScript(episode, previousEpisodes) {
  const client = getClient();

  const prevTitles = previousEpisodes.length > 0
    ? previousEpisodes.map(e => `Episode ${e.number}: "${e.title}"`).join(', ')
    : 'None (this is the first episode)';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Write Episode ${episode.number} of 12: "${episode.title}"
Description: ${episode.description}
This is part of a series. Previous episodes covered: ${prevTitles}.
Make sure this episode does not repeat content from prior episodes.`
    }],
  });

  return response.content[0].text;
}
