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

  const snakeClass = (order: number) => (order % 2 === 1 ? styles.snakeOdd : styles.snakeEven);

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
          const team = slot?.team === 0 ? 'radiant' : slot?.team === 1 ? 'dire' : null;

          const left = renderSlot(slot, 'radiant');
          const right = renderSlot(slot, 'dire');

          const rowClassName = `${styles.row} ${order % 2 === 0 ? styles.rowEven : styles.rowOdd}`;

          return (
            <div key={order} className={rowClassName} data-order={order}>
              {/* Radiant lane: slot -> connector -> number mast (если ход Radiant) */}
              <div className={styles.laneRadiant}>
                {left ? (
                  <>
                    {left}
                    <span className={styles.connector} aria-hidden />
                    <span className={`${styles.mastNumber} ${snakeClass(order)}`}>{order}</span>
                  </>
                ) : (
                  <>
                    <span className={styles.laneSpacer} aria-hidden />
                    <span className={styles.connectorSpacer} aria-hidden />
                    <span className={styles.mastNumber} aria-hidden />
                  </>
                )}
              </div>

              <div className={styles.midGap} aria-hidden />

              {/* Dire lane: number mast -> connector -> slot (если ход Dire) */}
              <div className={styles.laneDire}>
                {right ? (
                  <>
                    <span className={`${styles.mastNumber} ${snakeClass(order)}`}>{order}</span>
                    <span className={styles.connector} aria-hidden />
                    {right}
                  </>
                ) : (
                  <>
                    <span className={styles.mastNumber} aria-hidden />
                    <span className={styles.connectorSpacer} aria-hidden />
                    <span className={styles.laneSpacer} aria-hidden />
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
