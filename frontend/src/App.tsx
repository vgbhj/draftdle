import { useState, useCallback, useEffect } from 'react';
import type { GameDraft, Hero } from './types/api';
import { fetchRandomGame, getHeroes } from './api/client';
import { Header } from './components/Header';
import { DraftBoard } from './screens/DraftBoard';
import { HeroPicker } from './screens/HeroPicker';
import styles from './App.module.css';

export default function App() {
  const heroes = getHeroes();
  const [game, setGame] = useState<GameDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

const loadGame = useCallback(async () => {
  setLoading(true);
  setResult(null);
  try {
    const gameData = await fetchRandomGame();
    setGame(gameData);
    setLoading(false);
  } catch (e) {
    console.error(e);
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const handleGuessClick = useCallback(() => setPickerOpen(true), []);
  const handlePickerClose = useCallback(() => setPickerOpen(false), []);

  const handleHeroSelect = useCallback(
    (hero: Hero) => {
      if (!game) return;
      const correct = hero.id === game.secretPick.heroId;
      setResult(correct ? 'correct' : 'wrong');
      setPickerOpen(false);
    },
    [game]
  );

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.container}>
          <Header />
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className={styles.app}>
        <div className={styles.container}>
          <Header />
          <div className={styles.loading}>Failed to load game. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Header />
        <DraftBoard game={game} heroes={heroes} onGuess={handleGuessClick} />
      </div>
      {pickerOpen && (
        <HeroPicker
          heroes={heroes}
          onSelect={handleHeroSelect}
          onClose={handlePickerClose}
        />
      )}
      {result !== null && (
        <div
          className={`${styles.result} ${result === 'correct' ? styles.resultCorrect : styles.resultWrong}`}
          role="status"
        >
          {result === 'correct' ? 'Correct!' : 'Wrong. Try again!'}
          <button type="button" className={styles.playAgain} onClick={loadGame}>
            Play again
          </button>
        </div>
      )}
    </div>
  );
}