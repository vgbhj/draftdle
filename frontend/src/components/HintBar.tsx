import type { HeroAttribute, AttackType } from "../types/api";

export interface HintData {
  attribute?: HeroAttribute;
  attackType?: AttackType;
  teamName?: string;
  playerName?: string;
}

interface HintBarProps {
  hints: HintData;
  wrongGuesses: number;
  maxGuesses: number;
}

const ATTR_LABELS: Record<HeroAttribute, string> = {
  str: "STR",
  agi: "AGI",
  int: "INT",
  universal: "UNI",
};

const ATTR_COLORS: Record<HeroAttribute, string> = {
  str: "bg-red-500/30 border-red-400/40 text-red-300",
  agi: "bg-green-500/30 border-green-400/40 text-green-300",
  int: "bg-blue-500/30 border-blue-400/40 text-blue-300",
  universal: "bg-yellow-500/30 border-yellow-400/40 text-yellow-300",
};

export function HintBar({ hints, wrongGuesses, maxGuesses }: HintBarProps) {
  if (wrongGuesses === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        {hints.attribute && (
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold border ${ATTR_COLORS[hints.attribute]}`}
          >
            {ATTR_LABELS[hints.attribute]}
          </span>
        )}
        {hints.attackType && (
          <span className="px-2 py-0.5 rounded text-xs font-bold border bg-orange-500/30 border-orange-400/40 text-orange-300">
            {hints.attackType === "melee" ? "MELEE" : "RANGED"}
          </span>
        )}
        {hints.teamName && (
          <span className="px-2 py-0.5 rounded text-xs font-bold border bg-purple-500/30 border-purple-400/40 text-purple-300">
            {hints.teamName}
          </span>
        )}
        {hints.playerName && (
          <span className="px-2 py-0.5 rounded text-xs font-bold border bg-cyan-500/30 border-cyan-400/40 text-cyan-300">
            {hints.playerName}
          </span>
        )}
      </div>
      <span className="text-[10px] text-white/40">
        {wrongGuesses}/{maxGuesses}
      </span>
    </div>
  );
}
