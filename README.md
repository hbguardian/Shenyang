# Shenyang
Business/ explore

## Pulse Equipment Sourcing: China edition

Farrukh's trip app, built to work inside China, where claude.ai and Google are blocked.

- `src/app.html`: the app source (same as the claude.ai artifact Harris uses).
- `tools/build.py`: builds `docs/`. It strips Google Fonts, turns on offline/WeChat mode, and adds home-screen install plus offline caching.
- `docs/`: the site GitHub Pages serves.

Rebuild after changing the source: `python3 tools/build.py`

### How the two sides talk
Farrukh (China link): finish stops, log quotes and lessons. Each evening, tap **Send my update to Harris**, then paste it into WeChat.
Harris (claude.ai artifact): Trip tab, then **Paste Farrukh's WeChat update**. The update goes into the shared app.
