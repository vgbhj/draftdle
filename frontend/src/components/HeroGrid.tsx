import type { Hero } from '../types/api';
import { getHeroImageUrlFromHero } from '../utils/heroImages';
import styles from './HeroGrid.module.css';

interface HeroGridProps {
  heroes: Hero[];
  onSelect: (hero: Hero) => void;
}

export function HeroGrid({ heroes, onSelect }: HeroGridProps) {
  return (
    <div className={styles.grid}>
      {heroes.map((hero) => (
        <button
          key={hero.id}
          type="button"
          className={styles.card}
          onClick={() => onSelect(hero)}
          aria-label={hero.name}
        >
          <img
            src={getHeroImageUrlFromHero(hero, 'horizontal')}
            alt=""
            className={styles.avatar}
          />
          <span className={styles.name}>{hero.name}</span>
        </button>
      ))}
    </div>
  );
}
