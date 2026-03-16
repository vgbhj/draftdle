import { getHeroImageUrlFromHero } from "../utils/heroImages";
import type { Hero } from "../types/api";

interface DraftSlotProps {
  hero: Hero | null;
  isSecret?: boolean;
  isBan?: boolean;
  team?: "radiant" | "dire";
  slotNumber?: number;
  onGuess?: () => void;
}

export function DraftSlot({
  hero,
  isSecret,
  isBan,
  team,
  slotNumber,
  onGuess,
}: DraftSlotProps) {
  // const teamGlowClass =
  //   team === "radiant"
  //     ? "border-green-400/60 shadow-[0_0_0_1px_rgba(74,222,128,0.25),0_0_14px_rgba(74,222,128,0.22)]"
  //     : team === "dire"
  //       ? "border-red-400/60 shadow-[0_0_0_1px_rgba(248,113,113,0.25),0_0_14px_rgba(248,113,113,0.2)]"
  //       : "";

  if (isSecret) {
    return (
      <button
        type="button"
        className={`relative w-full h-10 rounded border-2 border-blue-400/50 bg-slate-900/90 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:border-blue-400/80 hover:scale-105 active:scale-95 ${
          team === "radiant"
            ? "shadow-lg shadow-green-500/15"
            : team === "dire"
              ? "shadow-lg shadow-red-500/15"
              : ""
        }`}
        onClick={onGuess}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-purple-950/40 to-transparent rounded pointer-events-none" />
        <div className="absolute -inset-1/2 bg-gradient-conic animate-spin pointer-events-none opacity-0" />
        <span className="relative z-10 text-xs font-semibold tracking-wider text-purple-200/95">
          PRESS TO GUESS
        </span>
        <span className="relative z-10 text-2xl font-bold text-purple-100/90">
          ?
        </span>
      </button>
    );
  }

  const imgUrl = hero ? getHeroImageUrlFromHero(hero, "horizontal") : null;

  if (isBan) {
    return (
      <div
        className="w-16 h-8 rounded border border-red-600/76 bg-slate-900/90 relative overflow-hidden flex-shrink-0"
        data-slot={slotNumber}
      >
        <div className="absolute inset-0 bg-red-950/55 pointer-events-none" />
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={hero?.name ?? ""}
            className="w-full h-full object-cover grayscale saturate-70"
          />
        ) : (
          <div className="w-full h-full bg-slate-800/60" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full h-12 rounded bg-slate-900/90 border border-purple-400/30 relative overflow-hidden flex items-center justify-center `}
      data-slot={slotNumber}
    >
      {slotNumber != null && (
        <span className="absolute top-0.5 left-1 z-10 text-xs font-bold text-white/70 drop-shadow">
          {slotNumber}
        </span>
      )}
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={hero?.name ?? ""}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-slate-800/60" />
      )}
    </div>
  );
}
