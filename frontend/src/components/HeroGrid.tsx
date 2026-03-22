import type { Hero } from "../types/api";
import { getHeroImageUrlFromHero } from "../utils/heroImages";

interface HeroGridProps {
  heroes: Hero[];
  onSelect: (hero: Hero) => void;
  unavailableIds?: ReadonlySet<number>;
}

export function HeroGrid({
  heroes,
  onSelect,
  unavailableIds,
}: HeroGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2 py-2 overflow-y-auto flex-1 min-h-0">
      {heroes.map((hero) => {
        const taken = unavailableIds?.has(hero.id) ?? false;
        return (
          <button
            key={hero.id}
            type="button"
            disabled={taken}
            className={`flex flex-col items-center gap-1 p-1 rounded border transition-all ${
              taken
                ? "cursor-not-allowed opacity-40 border-white/10 bg-slate-950/60 grayscale"
                : "bg-slate-900/80 border-purple-500/30 hover:border-purple-400/60 hover:scale-105 active:scale-95"
            }`}
            onClick={() => {
              if (!taken) onSelect(hero);
            }}
            aria-label={hero.name}
            aria-disabled={taken}
          >
            <img
              src={getHeroImageUrlFromHero(hero, "horizontal")}
              alt=""
              className="w-full aspect-square object-cover rounded bg-black/90"
            />
            <span className="text-xs text-purple-100/90 text-center leading-tight overflow-hidden text-ellipsis whitespace-nowrap w-full">
              {hero.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
