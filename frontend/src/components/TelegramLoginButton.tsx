import { useEffect, useRef } from "react";
import type { TelegramAuthData } from "../types/api";

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

interface TelegramLoginButtonProps {
  /** Username бота без @ (тот, которому сделали /setdomain в BotFather). */
  botName: string;
  onAuth: (data: TelegramAuthData) => void;
}

/**
 * Официальный Telegram Login Widget: скрипт telegram-widget.js рисует кнопку
 * в контейнере и после подтверждения входа зовёт глобальный onTelegramAuth.
 */
export function TelegramLoginButton({
  botName,
  onAuth,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onAuthRef = useRef(onAuth);

  useEffect(() => {
    onAuthRef.current = onAuth;
  }, [onAuth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !botName) return;

    window.onTelegramAuth = (user) => onAuthRef.current(user);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
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
  }, [botName]);

  return <div ref={containerRef} />;
}
