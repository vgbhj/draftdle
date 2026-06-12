import { useEffect, useRef, useState } from "react";
import type { TelegramAuthData } from "../types/api";

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

const WIDGET_SRC = "https://telegram.org/js/telegram-widget.js?22";

let widgetScriptPromise: Promise<void> | null = null;

/** Грузит telegram-widget.js один раз; повторные вызовы ждут тот же промис. */
function loadWidgetScript(): Promise<void> {
  if (!widgetScriptPromise) {
    widgetScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = WIDGET_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        widgetScriptPromise = null;
        script.remove();
        reject(new Error("failed to load telegram-widget.js"));
      };
      document.head.appendChild(script);
    });
  }
  return widgetScriptPromise;
}

interface TelegramLoginButtonProps {
  /** Username бота без @ (тот, которому сделали /setdomain в BotFather). */
  botName: string;
  /** Числовой ID бота (цифры до «:» в токене). Если задан — рисуем свою
   * кнопку в стиле проекта и зовём Telegram.Login.auth напрямую;
   * иначе fallback на официальный iframe-виджет. */
  botId?: string;
  onAuth: (data: TelegramAuthData) => void;
}

export function TelegramLoginButton({
  botName,
  botId,
  onAuth,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onAuthRef = useRef(onAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onAuthRef.current = onAuth;
  }, [onAuth]);

  // Кастомная кнопка: предзагружаем скрипт, чтобы popup открывался
  // синхронно из клика и не резался блокировщиком всплывающих окон.
  useEffect(() => {
    if (!botId) return;
    let cancelled = false;
    loadWidgetScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [botId]);

  // Fallback: официальный виджет рисует кнопку в контейнере и после
  // подтверждения входа зовёт глобальный onTelegramAuth.
  useEffect(() => {
    if (botId) return;
    const container = containerRef.current;
    if (!container || !botName) return;

    window.onTelegramAuth = (user) => onAuthRef.current(user);

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
      delete window.onTelegramAuth;
    };
  }, [botId, botName]);

  if (!botId) {
    return <div ref={containerRef} />;
  }

  const handleClick = () => {
    window.Telegram?.Login?.auth(
      { bot_id: botId, request_access: "write" },
      (data) => {
        if (data) onAuthRef.current(data);
      },
    );
  };

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-gradient-to-br from-purple-600/30 to-purple-900/30 border border-purple-400/20 hover:border-purple-400/40 hover:from-purple-600/40 font-bold text-purple-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3.5 h-3.5"
        aria-hidden="true"
      >
        <path d="M21.94 4.26 18.6 19.65c-.25 1.09-.91 1.36-1.84.85l-5.08-3.66-2.45 2.3c-.27.27-.5.5-1.02.5l.36-5.05 9.4-8.3c.41-.36-.09-.56-.63-.2L5.74 13.2.84 11.7c-1.07-.33-1.09-1.05.22-1.55L20.56 2.8c.89-.32 1.66.21 1.38 1.46Z" />
      </svg>
      LOGIN
    </button>
  );
}
