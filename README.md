# Little Thinkers — AI-Powered Philosophy Podcast Generator for Kids

A web app that generates, edits, and converts to audio a 12-episode philosophy podcast series for kids aged 7-9, using Claude for script writing and ElevenLabs for text-to-speech.

---

## Step 1: Install the Required Software

You need two things installed on your computer before starting.

### Install Node.js

1. Go to https://nodejs.org
2. Click the big green button that says **"LTS"** (the recommended version)
3. Open the downloaded file and follow the installer — just click "Next" through everything
4. To check it worked: open **Terminal** (Mac) or **Command Prompt** (Windows), type `node --version` and press Enter. You should see a version number like `v22.x.x`

### Install ffmpeg

This is needed to stitch together longer audio files.

**Mac:**
1. Open Terminal
2. If you have Homebrew installed, type: `brew install ffmpeg` and press Enter
3. If you don't have Homebrew: go to https://brew.sh, copy the install command, paste it into Terminal, press Enter. Then run `brew install ffmpeg`

**Windows:**
1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Under "Release builds", download the **ffmpeg-release-essentials.zip**
3. Unzip it, and move the folder somewhere permanent (like `C:\ffmpeg`)
4. Search "Environment Variables" in your Start menu, click "Edit the system environment variables"
5. Click "Environment Variables", find "Path" under System variables, click Edit, click New, and add `C:\ffmpeg\bin`
6. Click OK on everything, then restart Command Prompt

---

## Step 2: Get Your API Keys

You need two API keys (think of them like passwords that let the app talk to AI services).

### Anthropic API Key (for writing scripts)

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Go to "API Keys" in the sidebar
4. Click "Create Key"
5. Copy the key — it starts with `sk-ant-...`. Save it somewhere safe (a notes app is fine for now)
6. You will need to add a payment method and buy some credits (script generation costs roughly $0.01-0.05 per episode)

### ElevenLabs API Key (for generating audio)

1. Go to https://elevenlabs.io/
2. Create an account or sign in
3. Click your profile icon (top right) then "Profile + API key"
4. Copy your API key. Save it somewhere safe
5. The free tier gives you ~10,000 characters/month. A full episode script is around 10,000 characters, so you may want a paid plan ($5/month for 30,000 characters) to generate multiple episodes

---

## Step 3: Set Up the Project

Open **Terminal** (Mac) or **Command Prompt** (Windows). Then type each of these commands one at a time, pressing Enter after each:

```
cd path/to/this/folder
```
(Replace `path/to/this/folder` with the actual location of this project on your computer. For example: `cd ~/Documents/philo-audio` or `cd C:\Users\YourName\Documents\philo-audio`)

```
npm install
```
(Wait for it to finish — may take a minute)

```
cd client
npm install
cd ..
```
(Wait for it to finish again)

Now set up your API keys:

```
cp .env.example .env
```
(On Windows Command Prompt, use: `copy .env.example .env`)

Now open the `.env` file in any text editor (right-click the file, "Open With" > Notepad or TextEdit). It looks like this:

```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

Replace `your-anthropic-api-key-here` with the Anthropic key you copied earlier, and `your-elevenlabs-api-key-here` with the ElevenLabs key. No quotes, no spaces. It should look something like:

```
ANTHROPIC_API_KEY=sk-ant-abc123...
ELEVENLABS_API_KEY=xi-abc123...
```

Save and close the file.

---

## Step 4: Start the App

In your Terminal/Command Prompt (make sure you're in the project folder), type:

```
npm run dev
```

You'll see some text scroll by. When you see "ready in X ms", the app is running!

Open your web browser (Chrome, Safari, Firefox, etc.) and go to:

**http://localhost:5173**

You should see the Little Thinkers app!

To stop the app later, go back to Terminal and press **Ctrl+C**.

---

## Step 5: Using the App

### 1. Create Your Series

- When you first open the app, you'll see a "Generate Series Outline" button
- Click it and wait 15-30 seconds — Claude will create 12 episode ideas
- Read through the episode cards. You can click **Edit** on any card to change the title or description
- When you're happy with the lineup, click **Approve Series**

### 2. Generate Scripts

- Click **Dashboard** in the top navigation bar
- You'll see all 12 episodes listed with a "Planned" badge
- Click on any episode to open it
- Click **Generate Script** and wait 30-60 seconds
- The full script will appear in a text box. Read through it!
- Make any edits you want directly in the text box
- Click **Save Script** when you're done
- Go back to Dashboard — that episode now shows "Script Ready"

### 3. Generate Audio

- Open an episode that has a script ready
- Scroll down to the **Audio** section
- Choose a voice from the dropdown (Rachel is a good default)
- Click **Generate Audio** and wait (this can take 1-5 minutes depending on script length)
- Once done, you'll see an audio player — click play to listen!
- Click **Download MP3** to save the file to your computer

### 4. Repeat

Work through all 12 episodes at your own pace. The Dashboard tracks your progress — each episode moves from "Planned" to "Script Ready" to "Audio Ready".

---

## Troubleshooting

**"npm: command not found"** — Node.js isn't installed properly. Restart your Terminal and try again, or reinstall Node.js.

**"Missing required environment variables"** — Your `.env` file is missing or the API keys aren't filled in. Double-check Step 3.

**Scripts aren't generating** — Check that your Anthropic API key is correct and you have credits on your account.

**Audio isn't generating** — Check that your ElevenLabs API key is correct and you haven't exceeded your character limit.

**The app won't start** — Make sure you ran `npm install` in both the root folder AND the `client` folder (Step 3).

**"ffmpeg not found" when generating audio** — ffmpeg isn't installed or isn't in your system PATH. See Step 1.
