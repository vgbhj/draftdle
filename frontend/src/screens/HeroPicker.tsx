import { useMemo, useState } from 'react';
import type { Hero, HeroAttribute } from '../types/api';
import { HeroSearchBar } from '../components/HeroSearchBar';
import { AttributeFilters } from '../components/AttributeFilters';
import { HeroGrid } from '../components/HeroGrid';

interface HeroPickerProps {
  heroes: Hero[];
  onSelect: (hero: Hero) => void;
  onClose: () => void;
  /** Герои уже в драфте (кроме секретного слота) — нельзя выбрать. */
  unavailableHeroIds?: ReadonlySet<number>;
}

function filterHeroes(
  heroes: Hero[],
  search: string,
  attribute: HeroAttribute | 'all'
): Hero[] {
  let list = heroes;
  if (attribute !== 'all') {
    list = list.filter((h) => h.attribute === attribute);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.name_ru && h.name_ru.toLowerCase().includes(q))
    );
  }
  return list;
}

export function HeroPicker({
  heroes,
  onSelect,
  onClose,
  unavailableHeroIds,
}: HeroPickerProps) {
  const [search, setSearch] = useState('');
  const [attribute, setAttribute] = useState<HeroAttribute | 'all'>('all');

  const filtered = useMemo(
    () => filterHeroes(heroes, search, attribute),
    [heroes, search, attribute]
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/97 flex flex-col p-4" role="dialog" aria-modal="true" aria-label="Pick hero" style={{
      paddingLeft: `max(1rem, env(safe-area-inset-left, 0))`,
      paddingRight: `max(1rem, env(safe-area-inset-right, 0))`,
      paddingBottom: `max(1rem, env(safe-area-inset-bottom, 0))`,
      paddingTop: `max(1rem, env(safe-area-inset-top, 0))`,
    }}>
      <div className="flex flex-col flex-1 min-h-0 gap-2">
        <HeroSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Hero name..."
          onClose={onClose}
        />
        <AttributeFilters value={attribute} onChange={setAttribute} />
        <HeroGrid
          heroes={filtered}
          onSelect={onSelect}
          unavailableIds={unavailableHeroIds}
        />
      </div>
    </div>
  );
}
