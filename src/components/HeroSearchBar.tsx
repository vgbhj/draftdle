import styles from './HeroSearchBar.module.css';

interface HeroSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClose?: () => void;
}

export function HeroSearchBar({
  value,
  onChange,
  placeholder = 'Hero name...',
  onClose,
}: HeroSearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.iconSearch} aria-hidden>⌕</span>
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        autoComplete="off"
      />
      {onClose && (
        <button type="button" className={styles.iconClose} onClick={onClose} aria-label="Close">
          ✕
        </button>
      )}
    </div>
  );
}
