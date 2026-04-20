import { useState, useCallback, useMemo } from "react";
import type { GameDraft, Hero } from "./types/api";
import { fetchDraft, fetchDailyDraft, getHeroes } from "./api/client";
import { getHeroImageUrlFromHero } from "./utils/heroImages";
import { Header } from "./components/Header";
import { DraftBoard } from "./screens/DraftBoard";
import { HeroPicker } from "./screens/HeroPicker";
import { MainMenu } from "./screens/MainMenu";
import type { HintData } from "./components/HintBar";

type GameMode = "menu" | "daily" | "random";
const MAX_GUESSES = 5;

export default function App() {
  const heroes = getHeroes();
  const [mode, setMode] = useState<GameMode>("menu");
  const [game, setGame] = useState<GameDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [guessedHeroIds, setGuessedHeroIds] = useState<number[]>([]);

  const loadGame = useCallback(
    async (selectedMode: "daily" | "random") => {
      setLoading(true);
      setResult(null);
      setWrongGuesses(0);
      setGuessedHeroIds([]);
      try {
        const gameData =
          selectedMode === "daily" ? await fetchDailyDraft() : await fetchDraft();
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

        // Предзагружаем логотипы команд
        if (gameData.radiantTeam?.logoUrl) {
          const img = new Image();
          img.src = gameData.radiantTeam.logoUrl;
        }
        if (gameData.direTeam?.logoUrl) {
          const img = new Image();
          img.src = gameData.direTeam.logoUrl;
        }

        setGame(gameData);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    },
    [heroes],
  );

  const handleSelectMode = useCallback(
    (selectedMode: "daily" | "random") => {
      setMode(selectedMode);
      loadGame(selectedMode);
    },
    [loadGame],
  );

  const handleBack = useCallback(() => {
    setMode("menu");
    setGame(null);
    setResult(null);
    setWrongGuesses(0);
    setGuessedHeroIds([]);
    setPickerOpen(false);
  }, []);

  const handleGuessClick = useCallback(() => setPickerOpen(true), []);
  const handlePickerClose = useCallback(() => setPickerOpen(false), []);

  const hints = useMemo<HintData>(() => {
    if (!game || wrongGuesses === 0) return {};
    const secretHero = heroes.find((h) => h.id === game.secretPick.heroId);
    const h: HintData = {};
    if (wrongGuesses >= 1 && secretHero) h.attribute = secretHero.attribute;
    if (wrongGuesses >= 2 && secretHero) h.attackType = secretHero.attackType;
    if (wrongGuesses >= 3) {
      const team =
        game.secretPick.team === "radiant" ? game.radiantTeam : game.direTeam;
      h.teamName = team?.name || team?.tag || "Unknown";
    }
    if (wrongGuesses >= 4) {
      const playerName = game.players?.[String(game.secretPick.heroId)];
      h.playerName = playerName || "Unknown";
    }
    return h;
  }, [game, heroes, wrongGuesses]);

  const unavailableHeroIds = useMemo(() => {
    const s = new Set<number>();
    if (!game?.picksBans) return s;
    for (const slot of game.picksBans) {
      if (slot.isSecret) continue;
      s.add(slot.hero_id);
    }
    for (const id of guessedHeroIds) {
      s.add(id);
    }
    if (hints.attribute || hints.attackType) {
      for (const h of heroes) {
        if (s.has(h.id)) continue;
        if (hints.attribute && h.attribute !== hints.attribute) s.add(h.id);
        else if (hints.attackType && h.attackType !== hints.attackType) s.add(h.id);
      }
    }
    return s;
  }, [game, guessedHeroIds, hints, heroes]);

  const handleHeroSelect = useCallback(
    (hero: Hero) => {
      if (!game) return;
      const correct = hero.id === game.secretPick.heroId;
      setPickerOpen(false);

      if (correct) {
        setResult("correct");
        return;
      }

      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      setGuessedHeroIds((prev) => [...prev, hero.id]);
      if (newWrong >= MAX_GUESSES) {
        setResult("wrong");
      }
    },
    [game, wrongGuesses],
  );

  const isDaily = mode === "daily";

  // Menu screen
  if (mode === "menu") {
    return (
      <div className="h-screen h-[100dvh] bg-gradient-to-br from-purple-950 via-slate-950 to-black flex flex-col items-center justify-start text-purple-100 overflow-hidden">
        <div className="w-full max-w-md flex flex-col h-full overflow-hidden">
          <Header />
          <MainMenu onSelectMode={handleSelectMode} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black flex flex-col items-center justify-start text-purple-100">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <Header onClose={handleBack} />
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
          <Header onClose={handleBack} />
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
        <Header
          onClose={handleBack}
          title={isDaily ? "DAILY DRAFT" : "RANDOM DRAFT"}
        />
        <DraftBoard
          game={game}
          heroes={heroes}
          onGuess={handleGuessClick}
          hints={hints}
          wrongGuesses={wrongGuesses}
          maxGuesses={MAX_GUESSES}
        />
      </div>
      {pickerOpen && (
        <HeroPicker
          heroes={heroes}
          onSelect={handleHeroSelect}
          onClose={handlePickerClose}
          unavailableHeroIds={unavailableHeroIds}
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
                    <p className="text-white/50 text-sm">
                      {result === "correct"
                        ? `Guessed in ${wrongGuesses + 1} attempt${wrongGuesses > 0 ? "s" : ""}`
                        : `Used all ${MAX_GUESSES} attempts`}
                    </p>
                  </div>

                  {/* Информация о лиге и командах */}
                  {game.league && (
                    <div className="text-center text-white/60 text-xs">
                      <p className="font-semibold">{game.league.name}</p>
                    </div>
                  )}

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

                    {/* Статистика команд */}
                    <div className="text-white/70 text-sm mb-4 w-full">
                      <div className="flex gap-6 justify-center items-start mb-3">
                        {/* Radiant Team */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 bg-slate-800/50 rounded flex items-center justify-center overflow-hidden">
                            {game.radiantTeam?.logoUrl ? (
                              <img
                                src={game.radiantTeam.logoUrl}
                                alt={game.radiantTeam.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl text-slate-600">
                                🛡️
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-center">
                            {game.radiantTeam?.name || "RADIANT"}
                          </span>
                        </div>

                        <span className="text-white/40 mt-8">vs</span>

                        {/* Dire Team */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 bg-slate-800/50 rounded flex items-center justify-center overflow-hidden">
                            {game.direTeam?.logoUrl ? (
                              <img
                                src={game.direTeam.logoUrl}
                                alt={game.direTeam.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl text-slate-600">
                                ⚔️
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-center">
                            {game.direTeam?.name || "DIRE"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Кнопки */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold text-white transition-all cursor-pointer"
                      onClick={() => {
                        if (game?.matchId) {
                          window.open(
                            `https://ru.dotabuff.com/matches/${game.matchId}`,
                            "_blank",
                          );
                        }
                      }}
                    >
                      CHECK MATCH
                    </button>
                    {mode === "random" && (
                      <button
                        type="button"
                        className="px-6 py-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 rounded-lg font-bold text-white transition-all cursor-pointer"
                        onClick={() => loadGame("random")}
                      >
                        NEXT
                      </button>
                    )}
                    <button
                      type="button"
                      className="px-6 py-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg font-bold text-white/70 transition-all cursor-pointer"
                      onClick={handleBack}
                    >
                      MENU
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
