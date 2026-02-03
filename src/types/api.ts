/**
 * Типы под контракт API.
 */

export type HeroAttribute = 'str' | 'agi' | 'int' | 'universal';

export interface Hero {
  id: number;
  name: string;
  name_ru?: string;
  attribute: HeroAttribute;
  image?: string;
  /** Internal name for CDN (e.g. antimage, axe). */
  nameInternal?: string;
}

/** Ответ бэкенда: массив слотов драфта одного матча. */
export interface BackendDraftSlot {
  id: number;
  match_id: number;
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export type TeamKind = 'radiant' | 'dire';

export interface SecretPick {
  team: TeamKind;
  slotIndex: number;
  heroId: number;
}

export interface DraftSlot {
  heroId: number | null;
  isBan: boolean;
  slotIndex: number;
}

export interface TeamDraft {
  picks: (number | null)[];
  bans: (number | null)[];
}

export interface GameDraft {
  radiant: TeamDraft;
  dire: TeamDraft;
  secretPick: SecretPick;
}
