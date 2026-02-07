import type { Hero } from '../types/api';
import type { TeamDraft } from '../types/api';
import { DraftSlot } from './DraftSlot';
import styles from './TeamColumn.module.css';

interface TeamColumnProps {
  team: 'radiant' | 'dire';
  draft: TeamDraft;
  heroesMap: Map<number, Hero>;
  secretSlotIndex: number | null;
  onGuess: () => void;
}

export function TeamColumn({
  team,
  draft,
  heroesMap,
  secretSlotIndex,
  onGuess,
}: TeamColumnProps) {
  const label = team === 'radiant' ? 'RADIANT' : 'DIRE';
  const slots: { heroId: number | null; isBan: boolean; index: number }[] = [];
  draft.bans.forEach((heroId, i) => slots.push({ heroId, isBan: true, index: i }));
  draft.picks.forEach((heroId, i) => slots.push({ heroId, isBan: false, index: i }));

  return (
    <div className={styles.column} data-team={team}>
      <h2 className={styles.teamLabel}>{label}</h2>
      <div className={styles.slots}>
        {slots.map((s, i) => {
          const isSecret = secretSlotIndex !== null && i === secretSlotIndex;
          const hero = s.heroId !== null ? heroesMap.get(s.heroId) ?? null : null;
          return (
            <DraftSlot
              key={`${s.isBan ? 'b' : 'p'}-${s.index}`}
              hero={isSecret ? null : hero}
              isSecret={isSecret}
              isBan={s.isBan}
              slotNumber={i + 1}
              onGuess={isSecret ? onGuess : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
