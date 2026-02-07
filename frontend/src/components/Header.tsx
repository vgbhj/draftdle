import type { ReactNode } from 'react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import styles from './Header.module.css';

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
    <header className={styles.header}>
      <button type="button" className={styles.iconBtn} onClick={handleClose} aria-label="Close">
        ✕
      </button>
      <h1 className={styles.title}>{title}</h1>
      {rightAction ?? (
        <button type="button" className={styles.iconBtn} onClick={handleShare} aria-label="Share">
          ✈
        </button>
      )}
    </header>
  );
}
