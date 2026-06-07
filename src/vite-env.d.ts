// <reference types="vite/client" />

interface ImportMetaEnv {
    // URL of the serverless chat proxy (proxy/). Holds the OpenRouter key
    // server-side — no provider key is ever exposed to the browser.
    VITE_CHAT_PROXY_URL: string
    // Legacy: only used by the old src/components/Chatbot.tsx (not in the V2
    // build). Kept so that file still type-checks; do NOT use in new code.
    VITE_OPENAI_API_KEY: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }