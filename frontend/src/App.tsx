import { useState, useCallback, useEffect } from 'react';
import type { GameDraft, Hero } from './types/api';
import { fetchRandomGame, getHeroes } from './api/client';
import { Header } from './components/Header';
import { DraftBoard } from './screens/DraftBoard';
import { HeroPicker } from './screens/HeroPicker';

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
      if (gameData.matchId != null) {
        console.log('[Draftdle] Match ID:', gameData.matchId);
      }
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
      <div className="h-screen w-screen bg-slate-950 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center text-purple-100/90">Loading...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center text-purple-100/90">Failed to load game. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col">
      <div className="flex-1 flex flex-col">
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
          className={`fixed bottom-4 left-4 right-4 px-4 py-3 rounded-lg text-center font-semibold transition-all ${
            result === 'correct'
              ? 'bg-green-600/90 text-white'
              : 'bg-red-600/90 text-white'
          }`}
          role="status"
        >
          <div>{result === 'correct' ? 'Correct!' : 'Wrong. Try again!'}</div>
          <button 
            type="button" 
            className="mt-2 px-4 py-1 bg-white/20 hover:bg-white/30 rounded transition-all"
            onClick={loadGame}
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}