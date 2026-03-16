import type { ReactNode } from 'react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

interface HeaderProps {
  onClose?: () => void;
  onShare?: () => void;
  title?: string;
  rightAction?: ReactNode;
}

export function Header({ onClose, onShare, title = 'DRAFTDLE', rightAction }: HeaderProps) {
  const tg = useTelegramWebApp();

  const handleClose = () => {
    if (onClose) onClose();
    else tg.close();
  };

  const handleShare = () => {
    if (onShare) onShare();
    else tg.share(window.location.href, 'DRAFTDLE — угадай последний пик!');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-black/50 min-h-11 flex-shrink-0" style={{ paddingTop: `max(0.6rem, env(safe-area-inset-top, 0))` }}>
      <button 
        type="button" 
        className="w-10 h-10 flex items-center justify-center bg-transparent border-none text-purple-200/72 text-xl cursor-pointer rounded hover:bg-white/8 hover:text-white transition-all" 
        onClick={handleClose} 
        aria-label="Close"
      >
        ✕
      </button>
      <h1 className="m-0 text-xl font-bold tracking-wider text-purple-100/90">{title}</h1>
      {rightAction && <div>{rightAction}</div>}
      {!rightAction && (
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-transparent border-none text-purple-200/72 text-xl cursor-pointer rounded hover:bg-white/8 hover:text-white transition-all"
          onClick={handleShare}
          aria-label="Share"
        >
          ↗
        </button>
      )}
    </header>
  );
}
