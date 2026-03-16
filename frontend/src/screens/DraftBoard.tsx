import type { GameDraft, Hero, PickBanSlot } from '../types/api';
import { DraftSlot } from '../components/DraftSlot';

interface DraftBoardProps {
  game: GameDraft;
  heroes: Hero[];
  onGuess: () => void;
}

function buildHeroesMap(heroes: Hero[]): Map<number, Hero> {
  const map = new Map<number, Hero>();
  heroes.forEach((h) => map.set(h.id, h));
  return map;
}

function getSlotByOrder(picksBans: PickBanSlot[], order: number): PickBanSlot | null {
  return picksBans.find((p) => p.order === order) ?? null;
}

const ROWS = 24;

export function DraftBoard({ game, heroes, onGuess }: DraftBoardProps) {
  const heroesMap = buildHeroesMap(heroes);
  const picksBans = game.picksBans ?? [];

  const renderSlot = (slot: PickBanSlot | null, side: 'radiant' | 'dire') => {
    if (!slot) return null;
    const team = slot.team === 0 ? 'radiant' : slot.team === 1 ? 'dire' : undefined;
    if (team !== side) return null;

    const hero = heroesMap.get(slot.hero_id) ?? null;
    const isBan = !slot.is_pick;

    return (
      <DraftSlot
        hero={slot.isSecret ? null : hero}
        isSecret={!!slot.isSecret}
        isBan={isBan}
        team={team}
        onGuess={slot.isSecret ? onGuess : undefined}
      />
    );
  };

  const snakeClass = (order: number) => (order % 2 === 1 ? 'translate-x-0.5' : '-translate-x-0.5');

  return (
    <main className="flex-1 min-h-0 flex flex-col px-1 py-1">
      <div className="grid grid-cols-[1fr_0.5rem_1fr] gap-2 items-center mb-1 flex-shrink-0">
        <span className="text-center text-xs font-bold tracking-wider text-green-400/95">RADIANT</span>
        <span className="text-center text-xs font-bold text-white/50 min-w-6">№</span>
        <span className="text-center text-xs font-bold tracking-wider text-red-400/95">DIRE</span>
      </div>

      <div className="flex flex-col gap-px flex-1 min-h-0 overflow-hidden">
        {Array.from({ length: ROWS }, (_, i) => i + 1).map((order) => {
          const slot = getSlotByOrder(picksBans, order);

          const left = renderSlot(slot, 'radiant');
          const right = renderSlot(slot, 'dire');

          const rowClassName = `grid grid-cols-[1fr_0.5rem_1fr] gap-2 items-center flex-shrink-0 ${order % 2 === 0 ? 'relative -mt-2.5' : ''}`;

          return (
            <div key={order} className={rowClassName} data-order={order}>
              {/* Radiant lane: slot -> connector -> number mast (если ход Radiant) */}
              <div className="flex items-center justify-end gap-1 min-w-0">
                {left ? (
                  <>
                    {left}
                    <span className="h-px bg-white/30 flex-1 min-w-3" aria-hidden />
                    <span className={`w-5 text-center text-xs font-bold text-white/60 flex-shrink-0 ${snakeClass(order)}`}>{order}</span>
                  </>
                ) : (
                  <>
                    <span className="w-0 h-0" aria-hidden />
                    <span className="h-px opacity-0 flex-1 min-w-3" aria-hidden />
                    <span className="w-5 text-center text-xs font-bold text-white/60 flex-shrink-0" aria-hidden />
                  </>
                )}
              </div>

              <div aria-hidden />

              {/* Dire lane: number mast -> connector -> slot (если ход Dire) */}
              <div className="flex items-center justify-start gap-1 min-w-0">
                {right ? (
                  <>
                    <span className={`w-5 text-center text-xs font-bold text-white/60 flex-shrink-0 ${snakeClass(order)}`}>{order}</span>
                    <span className="h-px bg-white/30 flex-1 min-w-3" aria-hidden />
                    {right}
                  </>
                ) : (
                  <>
                    <span className="w-5 text-center text-xs font-bold text-white/60 flex-shrink-0" aria-hidden />
                    <span className="h-px opacity-0 flex-1 min-w-3" aria-hidden />
                    <span className="w-0 h-0" aria-hidden />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
