RootIB: RB-20260307022444-EC9B077B

# RepoTalker

AI-powered repo guide that scans a GitHub repository, generates human-friendly descriptions and narration scripts for every page, then creates a talking-head video for each one.

```
GitHub Repo
    │
    ▼  repoScanner.js
Page Map (data/pages.json)
    │
    ▼  descriptionGenerator.js  (LLM stub → plug in OpenAI / local model)
Summaries + Scripts
    │
    ▼  videoGenerator.js  (generic VIDEO_API stub → plug in D-ID / HeyGen / Sora)
Video URLs
    │
    ├──▶ React Dashboard  (frontend/)
    └──▶ Embeddable Widget  (widget/widget.js)
```

---

## Quick start

### 1. Backend

```bash
cd repotalker
cp .env.example .env      # fill in GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, VIDEO_API_*
npm install
npm run dev               # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd repotalker/frontend
npm install
npm start                 # opens http://localhost:5173
```

### 3. Run the pipeline

Open <http://localhost:5173> and click **Run full pipeline**.  
This will:
1. Scan the configured GitHub repo and build a page map
2. Generate descriptions + narration scripts (LLM stub by default)
3. Call the video API to create a talking-head video per page

---

## REST API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/pipeline/run` | Run scan → describe → video |
| `GET`  | `/api/pages` | List all pages with metadata + video URLs |
| `GET`  | `/api/pages/:id` | Get one page by path ID |

---

## Embeddable widget

Drop the following snippet into any HTML page:

```html
<div
  id="repotalker"
  data-page-id="docs/getting-started.md"
  data-api-base="https://your-backend.example.com"
></div>
<script src="https://your-cdn.example.com/widget.js"></script>
```

The widget renders a small card with the page's talking-head video and summary text.

---

## Swapping in a real LLM

Edit `src/services/descriptionGenerator.js` and replace `generateDescriptionFromContent` with a call to your preferred model (OpenAI, Anthropic, Ollama, etc.).

## Swapping in a real video provider

Edit `src/services/videoGenerator.js` and replace `requestTalkingHeadVideo` with the exact payload / endpoint shape of your chosen provider:

| Provider | Docs |
|----------|------|
| D-ID     | https://docs.d-id.com/reference/create-a-talk |
| HeyGen   | https://docs.heygen.com/reference/create-video-v2 |
| OpenAI Sora | https://platform.openai.com/docs/api-reference/video |

---

## Project structure

```
repotalker/
├── .env.example
├── package.json            ← backend (Node + Express, ESM)
├── src/
│   ├── server.js
│   └── services/
│       ├── pageStore.js          ← JSON-on-disk persistence
│       ├── repoScanner.js        ← GitHub Contents API walker
│       ├── descriptionGenerator.js  ← LLM stub
│       └── videoGenerator.js     ← video API stub
├── frontend/               ← React + Vite dashboard
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       └── App.jsx
└── widget/
    └── widget.js           ← embeddable per-page widget
```
