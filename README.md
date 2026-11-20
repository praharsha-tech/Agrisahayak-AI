# AgriSahayak AI

A responsive React frontend for a multilingual agricultural assistant.

## Run locally

```bash
npm install
npm run dev
```

## n8n integration

Copy `.env.example` to `.env` in the project root and set `VITE_N8N_WEBHOOK_URL` to the Production URL copied from your published n8n Webhook node:

```text
VITE_N8N_WEBHOOK_URL=https://your-n8n-host/webhook/your-production-path
```

The form sends a JSON `POST` with `location`, `crop`, `soil`, `question`, and `language`. The production response must be JSON with an `output` string; that text is shown in the existing crop advisory card. Restart `npm run dev` after changing the environment variable.

When the variable is unset, the app uses clearly labelled sample weather and advisory responses. `VITE_` variables are included in browser code, so use this only for the public webhook URL. Never place Gemini or other API keys in the frontend.
