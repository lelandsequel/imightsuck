# I Might Suck

A humorous website where people can type in an issue and our AI Guru will give an expletive-laden response as to if they suck at life or not.

## Features

- **Multiple Guru Personalities**: Choose from 6 different gurus, each with unique personalities:
  - 👶 The Teen Guru (PG-13)
  - ✍️ The Writer (Witty, literary, intelligently profane)
  - 🛋️ The Therapist (Gentle but honest)
  - 🎖️ The Drill Sergeant (Military-style, intense)
  - 🤔 The Philosopher (Deep, existential)
  - 🔥 The Savage (Completely unhinged)

- **Premium AI Voices**: Integration with ElevenLabs for high-quality, realistic voices
- **Animated Digital Avatars**: Canvas-based avatars with personality-matched animations
- **Response History**: Track your "Suck Score" and view past verdicts
- **Voice Input**: Speak your problems instead of typing
- **Dark Mode**: Toggle for late-night sessions
- **Share & Export**: Copy, share, or download responses

## Setup

1. Clone the repository
2. Open `index.html` in your browser
3. (Optional) Add your API keys in `script.js`:
   - Together AI API key for AI responses
   - ElevenLabs API key for premium voices

## Deployment

This site is automatically deployed to GitHub Pages via GitHub Actions. The site will be available at:
`https://lelandsequel.github.io/imightsuck/`

## API Keys

### Together AI (for AI responses)
1. Sign up at https://together.ai
2. Get your API key from the API Keys section
3. Replace `YOUR_API_KEY_HERE` in `script.js`

### ElevenLabs (for premium voices)
1. Sign up at https://elevenlabs.io
2. Get your API key
3. Enable "Use Premium AI Voices" in Voice Settings
4. Enter your API key in the settings panel

## Tech Stack

- Pure HTML/CSS/JavaScript
- Together AI API for LLM responses
- ElevenLabs API for premium text-to-speech
- Canvas API for animated avatars
- Web Speech API for voice input

## License

MIT
