import type { GameDraft, Hero, PickBanSlot } from '../types/api';
import { DraftSlot } from '../components/DraftSlot';
import styles from './DraftBoard.module.css';

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

  return (
    <main className={styles.board}>
      <div className={styles.header}>
        <span className={styles.headerRadiant}>RADIANT</span>
        <span className={styles.headerAxis}>№</span>
        <span className={styles.headerDire}>DIRE</span>
      </div>

      <div className={styles.grid}>
        {Array.from({ length: ROWS }, (_, i) => i + 1).map((order) => {
          const slot = getSlotByOrder(picksBans, order);
          const hero = slot ? heroesMap.get(slot.hero_id) ?? null : null;
          const isRadiant = slot?.team === 0;
          const isDire = slot?.team === 1;

          return (
            <div key={order} className={styles.row}>
              <div className={styles.zoneRadiant}>
                {isRadiant && slot && (
                  <DraftSlot
                    hero={slot.isSecret ? null : hero}
                    isSecret={!!slot.isSecret}
                    isBan={!slot.is_pick}
                    onGuess={slot.isSecret ? onGuess : undefined}
                  />
                )}
              </div>
              <div className={styles.zoneAxis}>
                <span className={styles.axisNumber}>{order}</span>
              </div>
              <div className={styles.zoneDire}>
                {isDire && slot && (
                  <DraftSlot
                    hero={slot.isSecret ? null : hero}
                    isSecret={!!slot.isSecret}
                    isBan={!slot.is_pick}
                    onGuess={slot.isSecret ? onGuess : undefined}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
