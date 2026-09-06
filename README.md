# Minimalist Ad Tool

Ad generator and brand/policy scorer for Minimalist (beminimalist.co), built as a PM assignment for Nudge.new.

**Live:** [minimalist-ad-tool.vercel.app](https://minimalist-ad-tool.vercel.app)

## Tech Stack

- **Client:** React 18, Vite, Tailwind CSS
- **Server:** Express (Node.js)
- **AI:** Claude API (claude-sonnet-4-6)
- **Built with:** Claude Code

## Setup

```bash
git clone https://github.com/ravitejamanipati-ravi/minimalist-ad-tool.git
cd minimalist-ad-tool
npm run install:all
cp server/.env.example server/.env
# Add your Anthropic API key to server/.env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
client/          # Vite/React frontend
server/          # Express API
server/prompts/  # Editable prompt files (generator + 3 scorer dimensions)
docs/            # Decision doc, failure modes, session transcript
```

## Docs

- [`docs/decision-doc.md`](docs/decision-doc.md) — one-page decision document
- [`docs/failure-modes.md`](docs/failure-modes.md) — top 3 production failure modes
- [`docs/transcript.md`](docs/transcript.md) — full Claude Code session transcript
