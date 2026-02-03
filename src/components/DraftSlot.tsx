import { getHeroImageUrlFromHero } from '../utils/heroImages';
import type { Hero } from '../types/api';
import styles from './DraftSlot.module.css';

interface DraftSlotProps {
  hero: Hero | null;
  isSecret?: boolean;
  isBan?: boolean;
  slotNumber?: number;
  onGuess?: () => void;
}

export function DraftSlot({ hero, isSecret, isBan, slotNumber, onGuess }: DraftSlotProps) {
  if (isSecret) {
    return (
      <button type="button" className={styles.slotSecret} onClick={onGuess}>
        <span className={styles.secretGlow} />
        <span className={styles.secretSwirl} aria-hidden />
        <span className={styles.guessLabel}>PRESS TO GUESS</span>
        <span className={styles.questionMark}>?</span>
      </button>
    );
  }

  const imgUrl = hero ? getHeroImageUrlFromHero(hero, 'horizontal') : null;
  return (
    <div className={`${styles.slot} ${isBan ? styles.slotBan : ''}`} data-slot={slotNumber}>
      {slotNumber != null && <span className={styles.slotNum}>{slotNumber}</span>}
      {imgUrl ? (
        <img src={imgUrl} alt={hero?.name ?? ''} className={styles.heroImg} />
      ) : (
        <div className={styles.placeholder} />
      )}
    </div>
  );
}
