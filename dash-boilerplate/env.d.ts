interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly VITE_STAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
