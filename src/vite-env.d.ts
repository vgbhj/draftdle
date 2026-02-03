/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK: string;
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  themeParams: Record<string, string>;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
