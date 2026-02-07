import type { HeroAttribute } from '../types/api';

export const ATTRIBUTES: { value: HeroAttribute; label: string }[] = [
  { value: 'str', label: 'Strength' },
  { value: 'agi', label: 'Agility' },
  { value: 'int', label: 'Intelligence' },
  { value: 'universal', label: 'Universal' },
];
