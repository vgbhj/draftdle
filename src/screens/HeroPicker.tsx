import { useMemo, useState } from 'react';
import type { Hero, HeroAttribute } from '../types/api';
import { HeroSearchBar } from '../components/HeroSearchBar';
import { AttributeFilters } from '../components/AttributeFilters';
import { HeroGrid } from '../components/HeroGrid';
import styles from './HeroPicker.module.css';

interface HeroPickerProps {
  heroes: Hero[];
  onSelect: (hero: Hero) => void;
  onClose: () => void;
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

export function HeroPicker({ heroes, onSelect, onClose }: HeroPickerProps) {
  const [search, setSearch] = useState('');
  const [attribute, setAttribute] = useState<HeroAttribute | 'all'>('all');

  const filtered = useMemo(
    () => filterHeroes(heroes, search, attribute),
    [heroes, search, attribute]
  );

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Pick hero">
      <div className={styles.panel}>
        <HeroSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Hero name..."
          onClose={onClose}
        />
        <AttributeFilters value={attribute} onChange={setAttribute} />
        <HeroGrid heroes={filtered} onSelect={onSelect} />
      </div>
    </div>
  );
}
