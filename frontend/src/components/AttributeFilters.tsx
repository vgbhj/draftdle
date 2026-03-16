import type { HeroAttribute } from '../types/api';
import { ATTRIBUTES } from '../constants/attributes';

interface AttributeFiltersProps {
  value: HeroAttribute | 'all';
  onChange: (value: HeroAttribute | 'all') => void;
}

const ALL_VALUE = 'all' as const;
const OPTIONS = [{ value: ALL_VALUE, label: 'All' }, ...ATTRIBUTES];

export function AttributeFilters({ value, onChange }: AttributeFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap py-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
            value === opt.value
              ? 'bg-purple-600/60 border-purple-400/70 text-white'
              : 'border-purple-400/40 bg-purple-950/80 text-purple-100/90 hover:bg-purple-900/90 hover:border-purple-400/50'
          }`}
          onClick={() => onChange(opt.value as HeroAttribute | 'all')}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
