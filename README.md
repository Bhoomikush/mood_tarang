# Mood Tarang 🎵 — Bollywood Mood Music Player

A mini web app where you pick a mood (Happy 😄, Sad 😢, Focused 📚, Energetic ⚡) and the whole UI — colors, background animation, floating particles — shifts to match, while a Bollywood playlist plays for that mood.

## Files

- `index.html` — page structure (mood buttons, player, playlist)
- `style.css` — mood themes, gradients, particle & disc animations
- `script.js` — mood switching, audio controls, playlist logic
- `songs/` — put your own MP3s here, sorted by mood folder

## How to run

1. Download/unzip the folder.
2. Open `index.html` in your browser (double-click, or use VS Code Live Server).

## Adding music

Each mood folder in `songs/` expects specific file names — check the `songs` list at the top of `script.js` to see which names to use (e.g. `songs/happy/london-thumakda.mp3`). No local file yet? Just click the **▶ YouTube** button next to any track to listen there instead.

## Skills used

DOM manipulation · Audio controls · CSS animations · Event handling