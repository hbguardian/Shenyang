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

### Tests
Run from the repo root after `python3 tools/build.py` (needs Playwright with Chromium):
- `node tests/china.mjs`: installs the offline copy, then opens the app with no internet and on a hanging connection, and checks the "new version" prompt.
- `node tests/monkey.mjs`: taps every button on every screen at three phone widths and fails on any script error or sideways scrolling.
- `node tests/handoff.mjs`: sends Farrukh's WeChat update into Harris's app and checks it arrives.

### PDF guide
`node tools/make_pdf.mjs` (after `python3 tools/build.py`) writes `docs/Pulse-China-Trip.pdf`: the same content as the app, laid out for a phone screen (A5). It works anywhere, including inside WeChat, with no internet.
