import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramWebApp() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
    WebApp.ready();
    WebApp.expand();
    const tp = WebApp.themeParams;
    if (tp && typeof tp === 'object') {
      const root = document.documentElement;
      if (tp.bg_color) root.style.setProperty('--tg-bg', tp.bg_color);
      if (tp.text_color) root.style.setProperty('--tg-text', tp.text_color);
      if (tp.button_color) root.style.setProperty('--tg-button', tp.button_color);
    }
  }, []);

  const share = (url: string, text: string) => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    WebApp.openTelegramLink(shareUrl);
  };

  return {
    close: () => WebApp.close(),
    openLink: (url: string) => WebApp.openLink(url),
    share,
    themeParams: typeof window !== 'undefined' ? WebApp.themeParams : undefined,
  };
}
