# Chat proxy (Cloudflare Worker)

Keeps the OpenRouter API key **server-side**. The browser calls this Worker; the
Worker adds the key and forwards to OpenRouter. The key is never in the JS bundle.

This exists because a `VITE_`-prefixed key gets baked into the public bundle at
build time and was scraped off the live site and drained. Never ship a provider
key to the browser again.

## Hardening built in

- Origin allowlist enforced server-side (see `ALLOWED_ORIGINS` in `src/index.js`).
- Model allowlist enforced server-side — callers cannot choose the model, so the
  worst-case cost is bounded to small / free models.
- System prompt injected server-side — callers cannot override it.
- Hard caps on output tokens, message count, and input size.

## Deploy (one time, ~5 min)

```bash
cd proxy
npm install
npx wrangler login                 # opens browser, log into Cloudflare (free)
npx wrangler secret put OPENROUTER_KEY   # paste a NEW OpenRouter key when prompted
npx wrangler deploy
```

`deploy` prints the live URL, e.g.

```
https://ejacoby-chat-proxy.<your-subdomain>.workers.dev
```

Copy that URL.

## Wire the frontend to it

In the **portfolio** repo set the proxy URL (no key — just the URL):

- Local dev: add to `.env`
  ```
  VITE_CHAT_PROXY_URL=https://ejacoby-chat-proxy.<your-subdomain>.workers.dev
  ```
- Amplify: Hosting → Environment variables → add `VITE_CHAT_PROXY_URL` with the
  same value, then redeploy. **Delete the old `VITE_OPENROUTER_API_KEY` variable.**

## Local development

```bash
cd proxy
echo 'OPENROUTER_KEY=sk-or-v1-...' > .dev.vars   # gitignored
npm run dev                                      # serves on http://localhost:8787
```

Point `VITE_CHAT_PROXY_URL=http://localhost:8787` while testing locally.

## Updating the system prompt / models

Both live in `src/index.js` (`SYSTEM_PROMPT`, `MODELS`). Edit, then
`npx wrangler deploy`.
