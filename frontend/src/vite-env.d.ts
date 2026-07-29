/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the deployed backend API, e.g. https://your-app.onrender.com/api.
   * Unset in local dev — Vite's dev server proxies '/api' to localhost:5000 instead.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}