import { useCallback, useEffect, useState } from "react";
import type { AuthUser, TelegramAuthData } from "../types/api";
import { fetchMe, loginWithTelegram, logoutSession } from "../api/client";

/**
 * Сессия хранится в httpOnly-cookie, поэтому единственный способ узнать
 * «залогинен ли я» — спросить бэкенд через /auth/me при старте приложения.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((e) => console.error("[Auth] me failed:", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: TelegramAuthData) => {
    try {
      const u = await loginWithTelegram(data);
      setUser(u);
    } catch (e) {
      console.error("[Auth] login failed:", e);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } catch (e) {
      console.error("[Auth] logout failed:", e);
    }
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
