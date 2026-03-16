import { useState, useCallback, useEffect } from "react";
import type { GameDraft, Hero } from "./types/api";
import { fetchRandomGame, getHeroes } from "./api/client";
import { Header } from "./components/Header";
import { DraftBoard } from "./screens/DraftBoard";
import { HeroPicker } from "./screens/HeroPicker";

export default function App() {
  const heroes = getHeroes();
  const [game, setGame] = useState<GameDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const gameData = await fetchRandomGame();
      if (gameData.matchId != null) {
        console.log("[Draftdle] Match ID:", gameData.matchId);
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
      setResult(correct ? "correct" : "wrong");
      setPickerOpen(false);
    },
    [game],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black flex flex-col items-center justify-start text-purple-100">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center px-8 py-8">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black flex flex-col items-center justify-start text-purple-100">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center px-8 py-8">
            Failed to load game. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-gradient-to-br from-purple-950 via-slate-950 to-black flex flex-col items-center justify-start text-purple-100 overflow-hidden">
      <div className="w-full max-w-md flex flex-col h-full overflow-hidden">
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
          className={`fixed z-50 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-4 rounded-lg text-center font-semibold box-shadow-lg flex flex-col gap-3 border ${
            result === "correct"
              ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-100"
              : "bg-red-900/90 border-red-500/50 text-red-100"
          }`}
          role="status"
          style={{ bottom: `calc(1.5rem + env(safe-area-inset-bottom, 0))` }}
        >
          <div>{result === "correct" ? "Correct!" : "Wrong. Try again!"}</div>
          <button
            type="button"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded font-semibold transition-all cursor-pointer"
            onClick={loadGame}
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
