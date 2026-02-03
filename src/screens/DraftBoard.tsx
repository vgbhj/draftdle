import type { GameDraft, Hero } from '../types/api';
import { TeamColumn } from '../components/TeamColumn';
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

/** Индекс скрытого слота в общем списке слотов команды (баны, затем пики). */
function getSecretSlotIndex(
  team: 'radiant' | 'dire',
  game: GameDraft
): number | null {
  if (game.secretPick.team !== team) return null;
  return game[team].bans.length + game.secretPick.slotIndex;
}

export function DraftBoard({ game, heroes, onGuess }: DraftBoardProps) {
  const heroesMap = buildHeroesMap(heroes);

  return (
    <main className={styles.board}>
      <div className={styles.teams}>
        <TeamColumn
          team="radiant"
          draft={game.radiant}
          heroesMap={heroesMap}
          secretSlotIndex={getSecretSlotIndex('radiant', game)}
          onGuess={onGuess}
        />
        <TeamColumn
          team="dire"
          draft={game.dire}
          heroesMap={heroesMap}
          secretSlotIndex={getSecretSlotIndex('dire', game)}
          onGuess={onGuess}
        />
      </div>
    </main>
  );
}
