/**
 * Моковые данные для разработки до подключения реального API.
 */

import type { GameDraft, Hero } from '../types/api';

export const MOCK_HEROES: Hero[] = [
  { id: 1, name: 'Anti-Mage', attribute: 'agi' },
  { id: 2, name: 'Axe', attribute: 'str' },
  { id: 3, name: 'Crystal Maiden', attribute: 'int' },
  { id: 4, name: 'Invoker', attribute: 'int' },
  { id: 5, name: 'Pudge', attribute: 'str' },
  { id: 6, name: 'Earthshaker', attribute: 'str' },
  { id: 7, name: 'Storm Spirit', attribute: 'int' },
  { id: 8, name: 'Lina', attribute: 'int' },
  { id: 9, name: 'Phantom Assassin', attribute: 'agi' },
  { id: 10, name: 'Juggernaut', attribute: 'agi' },
  { id: 11, name: 'Ogre Magi', attribute: 'str' },
  { id: 12, name: 'Shadow Fiend', attribute: 'agi' },
  { id: 13, name: 'Tiny', attribute: 'str' },
  { id: 14, name: 'Windranger', attribute: 'universal' },
  { id: 15, name: 'Zeus', attribute: 'int' },
];

export const MOCK_GAME: GameDraft = {
  radiant: {
    bans: [1, 2, 3, 4, 5, 6],
    picks: [7, 8, 9, 10, 11],
  },
  dire: {
    bans: [2, 4, 6, 8, 10, 12],
    picks: [1, 3, 5, 9, 14],
  },
  secretPick: {
    team: 'dire',
    slotIndex: 4,
    heroId: 14,
  },
};
