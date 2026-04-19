interface MainMenuProps {
  onSelectMode: (mode: "daily" | "random") => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
      <h2 className="text-2xl font-bold text-purple-100/90 tracking-wide text-center">
        Choose Mode
      </h2>

      <button
        type="button"
        className="w-full max-w-xs p-5 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-900/30 border border-purple-400/20 hover:border-purple-400/40 hover:from-purple-600/40 transition-all cursor-pointer text-left"
        onClick={() => onSelectMode("daily")}
      >
        <div className="text-lg font-bold text-purple-100 mb-1">
          Daily Draft
        </div>
        <div className="text-sm text-purple-200/60">
          One match per day. 5 attempts with progressive hints.
        </div>
      </button>

      <button
        type="button"
        className="w-full max-w-xs p-5 rounded-xl bg-gradient-to-br from-slate-600/30 to-slate-900/30 border border-slate-400/20 hover:border-slate-400/40 hover:from-slate-600/40 transition-all cursor-pointer text-left"
        onClick={() => onSelectMode("random")}
      >
        <div className="text-lg font-bold text-purple-100 mb-1">
          Random Draft
        </div>
        <div className="text-sm text-purple-200/60">
          Endless practice. New random match each time.
        </div>
      </button>
    </div>
  );
}
