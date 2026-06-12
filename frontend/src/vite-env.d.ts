/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK: string;
  readonly VITE_API_BASE: string;
  readonly VITE_TG_BOT_NAME?: string;
  readonly VITE_TG_BOT_ID?: string;
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

interface TelegramLoginWidget {
  auth: (
    options: { bot_id: string; request_access?: string; lang?: string },
    callback: (
      data: import("./types/api").TelegramAuthData | false,
    ) => void,
  ) => void;
}

interface Window {
  Telegram?: { WebApp?: TelegramWebApp; Login?: TelegramLoginWidget };
}
