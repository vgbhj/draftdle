import { useState, useCallback, useEffect } from "react";
import type { GameDraft, Hero } from "./types/api";
import { fetchRandomGame, getHeroes } from "./api/client";
import { getHeroImageUrlFromHero } from "./utils/heroImages";
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

      // Предзагружаем изображение героя
      if (gameData.secretPick) {
        const secretHero = heroes.find(
          (h) => h.id === gameData.secretPick.heroId,
        );
        if (secretHero) {
          const imageUrl = getHeroImageUrlFromHero(secretHero, "vertical");
          const img = new Image();
          img.src = imageUrl;
        }
      }

      setGame(gameData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [heroes]);

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
      {result !== null && game && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 py-8">
            {(() => {
              const secretHero = heroes.find(
                (h) => h.id === game.secretPick.heroId,
              );
              return (
                <>
                  {/* Заголовок результата */}
                  <div className="text-center">
                    <h2
                      className={`text-4xl font-bold mb-2 ${result === "correct" ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {result === "correct" ? "CONGRATS!" : "WRONG!"}
                    </h2>
                    <p className="text-sm text-white/60">TODAY'S HERO IS:</p>
                  </div>

                  {/* Информация о герое */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {secretHero?.name.toUpperCase()}
                    </h3>

                    {/* Картинка героя */}
                    <div className="w-full max-w-xs bg-gradient-to-b from-purple-600/30 to-transparent rounded-lg overflow-hidden mb-4">
                      <img
                        src={
                          secretHero
                            ? getHeroImageUrlFromHero(secretHero, "vertical")
                            : "/placeholder-hero.svg"
                        }
                        alt="hero"
                        className="w-full h-auto"
                      />
                    </div>

                    {/* Статистика */}
                    <div className="text-white/70 text-sm mb-4">
                      <p>ATTEMPTS: 11</p>
                      <p>FALCONS - VP 11.11.2026</p>
                    </div>
                  </div>

                  {/* Кнопка */}
                  <button
                    type="button"
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold text-white transition-all cursor-pointer"
                    onClick={loadGame}
                  >
                    CHECK MATCH
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
