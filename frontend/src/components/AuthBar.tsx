import type { AuthUser, TelegramAuthData } from "../types/api";
import { TelegramLoginButton } from "./TelegramLoginButton";

const BOT_NAME: string = import.meta.env.VITE_TG_BOT_NAME ?? "";
const BOT_ID: string = import.meta.env.VITE_TG_BOT_ID ?? "";

interface AuthBarProps {
  user: AuthUser | null;
  loading: boolean;
  onAuth: (data: TelegramAuthData) => void;
  onLogout: () => void;
}

/** Блок в правой части шапки: виджет входа для гостя, имя + Logout для своих. */
export function AuthBar({ user, loading, onAuth, onLogout }: AuthBarProps) {
  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.photo_url && (
          <img
            src={user.photo_url}
            alt=""
            className="w-7 h-7 rounded-full border border-purple-400/30"
          />
        )}
        <span className="text-xs text-purple-100/90 font-semibold">
          {user.username || user.first_name}
        </span>
        <button
          type="button"
          className="px-2 py-1 text-xs bg-white/5 hover:bg-white/15 border border-white/10 rounded font-bold text-white/70 transition-all cursor-pointer"
          onClick={onLogout}
        >
          LOGOUT
        </button>
      </div>
    );
  }

  if (!BOT_NAME && !BOT_ID) return null;

  return <TelegramLoginButton botName={BOT_NAME} botId={BOT_ID} onAuth={onAuth} />;
}
