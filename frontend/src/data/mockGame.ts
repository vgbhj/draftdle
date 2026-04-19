/**
 * Моковые данные для разработки до подключения реального API.
 */

import type { GameDraft, Hero, PickBanSlot } from '../types/api';

export const MOCK_HEROES: Hero[] = [
  { id: 1, name: 'Anti-Mage', attribute: 'agi', attackType: 'melee' },
  { id: 2, name: 'Axe', attribute: 'str', attackType: 'melee' },
  { id: 3, name: 'Crystal Maiden', attribute: 'int', attackType: 'ranged' },
  { id: 4, name: 'Invoker', attribute: 'int', attackType: 'ranged' },
  { id: 5, name: 'Pudge', attribute: 'str', attackType: 'melee' },
  { id: 6, name: 'Earthshaker', attribute: 'str', attackType: 'melee' },
  { id: 7, name: 'Storm Spirit', attribute: 'int', attackType: 'ranged' },
  { id: 8, name: 'Lina', attribute: 'int', attackType: 'ranged' },
  { id: 9, name: 'Phantom Assassin', attribute: 'agi', attackType: 'melee' },
  { id: 10, name: 'Juggernaut', attribute: 'agi', attackType: 'melee' },
  { id: 11, name: 'Ogre Magi', attribute: 'str', attackType: 'melee' },
  { id: 12, name: 'Shadow Fiend', attribute: 'agi', attackType: 'ranged' },
  { id: 13, name: 'Tiny', attribute: 'str', attackType: 'melee' },
  { id: 14, name: 'Windranger', attribute: 'universal', attackType: 'ranged' },
  { id: 15, name: 'Zeus', attribute: 'int', attackType: 'ranged' },
];

const MOCK_PICKS_BANS: PickBanSlot[] = [
  { order: 1, team: 0, is_pick: false, hero_id: 1 },
  { order: 2, team: 0, is_pick: false, hero_id: 2 },
  { order: 3, team: 1, is_pick: false, hero_id: 2 },
  { order: 4, team: 1, is_pick: false, hero_id: 4 },
  { order: 5, team: 0, is_pick: false, hero_id: 3 },
  { order: 6, team: 1, is_pick: false, hero_id: 6 },
  { order: 7, team: 1, is_pick: false, hero_id: 8 },
  { order: 8, team: 0, is_pick: true, hero_id: 7 },
  { order: 9, team: 1, is_pick: true, hero_id: 1 },
  { order: 10, team: 0, is_pick: false, hero_id: 4 },
  { order: 11, team: 0, is_pick: false, hero_id: 5 },
  { order: 12, team: 1, is_pick: false, hero_id: 10 },
  { order: 13, team: 1, is_pick: true, hero_id: 3 },
  { order: 14, team: 0, is_pick: true, hero_id: 8 },
  { order: 15, team: 0, is_pick: true, hero_id: 9 },
  { order: 16, team: 1, is_pick: true, hero_id: 5 },
  { order: 17, team: 1, is_pick: true, hero_id: 9 },
  { order: 18, team: 0, is_pick: true, hero_id: 10 },
  { order: 19, team: 0, is_pick: false, hero_id: 6 },
  { order: 20, team: 1, is_pick: false, hero_id: 12 },
  { order: 21, team: 0, is_pick: false, hero_id: 11 },
  { order: 22, team: 1, is_pick: false, hero_id: 11 },
  { order: 23, team: 0, is_pick: true, hero_id: 11 },
  { order: 24, team: 1, is_pick: true, hero_id: 14, isSecret: true },
];

export const MOCK_GAME: GameDraft = {
  radiant: { bans: [1, 2, 3, 4, 5, 6], picks: [7, 8, 9, 10, 11] },
  dire: { bans: [2, 4, 6, 8, 10, 12], picks: [1, 3, 5, 9, 14] },
  secretPick: { team: 'dire', slotIndex: 4, heroId: 14 },
  picksBans: MOCK_PICKS_BANS,
};
