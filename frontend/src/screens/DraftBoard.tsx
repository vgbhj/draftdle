import type { GameDraft, Hero, PickBanSlot } from "../types/api";
import { DraftSlot } from "../components/DraftSlot";
import { HintBar, type HintData } from "../components/HintBar";

interface DraftBoardProps {
  game: GameDraft;
  heroes: Hero[];
  onGuess: () => void;
  hints?: HintData;
  wrongGuesses?: number;
  maxGuesses?: number;
}

function buildHeroesMap(heroes: Hero[]): Map<number, Hero> {
  const map = new Map<number, Hero>();
  heroes.forEach((h) => map.set(h.id, h));
  return map;
}

export function DraftBoard({ game, heroes, onGuess, hints, wrongGuesses, maxGuesses }: DraftBoardProps) {
  const heroesMap = buildHeroesMap(heroes);
  const picksBans = game.picksBans ?? [];

  // 1. Разделяем слоты по командам заранее
  const radiantSlots = picksBans.filter((s) => s.team === 0);
  const direSlots = picksBans.filter((s) => s.team === 1);

  const renderSingleSlot = (slot: PickBanSlot, side: "radiant" | "dire") => {
    const hero = heroesMap.get(slot.hero_id) ?? null;
    const isBan = !slot.is_pick;
    const showHints = !!slot.isSecret && hints && wrongGuesses != null && wrongGuesses > 0;

    return (
      <div key={slot.order} className="flex-shrink-0">
        <div className="flex items-center gap-1">
          {side === "radiant" ? (
            <>
              <DraftSlot
                hero={slot.isSecret ? null : hero}
                isSecret={!!slot.isSecret}
                isBan={isBan}
                team="radiant"
                onGuess={slot.isSecret ? onGuess : undefined}
              />
              <span className="h-px bg-white/20 flex-1 min-w-[10px]" />
              <span className="w-5 text-center text-[10px] font-bold text-white/40">
                {slot.order + 1}
              </span>
            </>
          ) : (
            <>
              <span className="w-5 text-center text-[10px] font-bold text-white/40">
                {slot.order + 1}
              </span>
              <span className="h-px bg-white/20 flex-1 min-w-[10px]" />
              <DraftSlot
                hero={slot.isSecret ? null : hero}
                isSecret={!!slot.isSecret}
                isBan={isBan}
                team="dire"
                onGuess={slot.isSecret ? onGuess : undefined}
              />
            </>
          )}
        </div>
        {showHints && (
          <HintBar hints={hints} wrongGuesses={wrongGuesses} maxGuesses={maxGuesses ?? 5} />
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 min-h-0 flex flex-col p-1">
      {/* Заголовки */}
      <div className="grid grid-cols-2 gap-8 mb-2">
        <div className="text-center text-xs font-bold tracking-wider text-green-400/90">
          RADIANT
        </div>
        <div className="text-center text-xs font-bold tracking-wider text-red-400/90">
          DIRE
        </div>
      </div>

      {/* Основной контейнер с двумя колонками */}
      <div className="flex flex-1 min-h-0 gap-8">
        {/* Колонка Radiant */}
        <div className="flex-1 flex flex-col gap-1 overflow-hidden justify-between">
          {radiantSlots.map((slot) => renderSingleSlot(slot, "radiant"))}
        </div>

        {/* Колонка Dire */}
        <div className="flex-1 flex flex-col gap-1 overflow-hidden justify-between">
          {direSlots.map((slot) => renderSingleSlot(slot, "dire"))}
        </div>
      </div>
    </main>
  );
}
