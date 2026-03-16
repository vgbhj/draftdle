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
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 rounded border border-purple-400/30">
      <span className="text-purple-200/60 text-lg" aria-hidden>⌕</span>
      <input
        type="search"
        className="flex-1 min-w-0 bg-transparent border-none text-purple-100/90 text-sm outline-none placeholder:text-purple-200/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        autoComplete="off"
      />
      {onClose && (
        <button 
          type="button" 
          className="w-8 h-8 flex items-center justify-center bg-transparent border-none text-purple-200/72 cursor-pointer rounded hover:bg-white/8 hover:text-white transition-all" 
          onClick={onClose} 
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}
