import type { HeroAttribute } from '../types/api';
import { ATTRIBUTES } from '../constants/attributes';
import styles from './AttributeFilters.module.css';

interface AttributeFiltersProps {
  value: HeroAttribute | 'all';
  onChange: (value: HeroAttribute | 'all') => void;
}

const ALL_VALUE = 'all' as const;
const OPTIONS = [{ value: ALL_VALUE, label: 'All' }, ...ATTRIBUTES];

export function AttributeFilters({ value, onChange }: AttributeFiltersProps) {
  return (
    <div className={styles.wrapper}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.btn} ${value === opt.value ? styles.btnActive : ''}`}
          onClick={() => onChange(opt.value as HeroAttribute | 'all')}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
