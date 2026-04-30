// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_OPENAI_API_KEY: string
    VITE_OPENROUTER_API_KEY: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }