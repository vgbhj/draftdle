/**
 * API-клиент. GET /api/v1/draft — полный матч (слоты, команды, лига).
 * Список героев — статичный на фронте (см. data/heroes.ts).
 */

import type {
  GameDraft,
  Hero,
  BackendDraftSlot,
  BackendDraftResponse,
  TeamKind,
  PickBanSlot,
} from "../types/api";
import { HEROES_LIST } from "../data/heroes";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

/** Преобразует ответ бэкенда в формат доски. team: 0 = Radiant, 1 = Dire. */
export function transformDraftToGame(slots: BackendDraftSlot[]): GameDraft {
  const sorted = [...slots].sort((a, b) => a.order - b.order);
  const seenOrder = new Set<number>();
  const unique: BackendDraftSlot[] = [];
  for (const s of sorted) {
    if (seenOrder.has(s.order)) continue;
    seenOrder.add(s.order);
    unique.push(s);
  }
  const matchId = unique[0]?.match_id;
  const radiant = { bans: [] as number[], picks: [] as number[] };
  const dire = { bans: [] as number[], picks: [] as number[] };
  const picksBans: PickBanSlot[] = [];

  let lastPick: { team: TeamKind; heroId: number; pickIndex: number } | null =
    null;

  for (const s of unique) {
    const team = s.team === 0 ? "radiant" : "dire";
    const side = team === "radiant" ? radiant : dire;
    if (s.is_pick) {
      const pickIndex = side.picks.length;
      side.picks.push(s.hero_id);
      lastPick = { team, heroId: s.hero_id, pickIndex };
    } else {
      side.bans.push(s.hero_id);
    }
    picksBans.push({
      order: s.order,
      team: s.team,
      is_pick: s.is_pick,
      hero_id: s.hero_id,
      isSecret: false,
    });
  }

  if (!lastPick) {
    throw new Error("No pick in draft");
  }

  const lastEntry = picksBans[picksBans.length - 1];
  if (lastEntry?.is_pick) {
    lastEntry.isSecret = true;
  }

  return {
    matchId,
    radiant: { bans: radiant.bans, picks: radiant.picks },
    dire: { bans: dire.bans, picks: dire.picks },
    secretPick: {
      team: lastPick.team,
      slotIndex: lastPick.pickIndex,
      heroId: lastPick.heroId,
    },
    picksBans,
  };
}

export function matchFullToGameDraft(res: BackendDraftResponse): GameDraft {
  const game = transformDraftToGame(res.slots);
  game.matchId = res.match_id;
  if (res.radiant_team) {
    game.radiantTeam = {
      teamId: res.radiant_team.team_id,
      name: res.radiant_team.name,
      tag: res.radiant_team.tag,
      logoUrl: res.radiant_team.logo_url,
    };
  }
  if (res.dire_team) {
    game.direTeam = {
      teamId: res.dire_team.team_id,
      name: res.dire_team.name,
      tag: res.dire_team.tag,
      logoUrl: res.dire_team.logo_url,
    };
  }
  if (res.league) {
    game.league = {
      leagueId: res.league.id,
      name: res.league.name,
      tier: String(res.league.tier),
    };
  }
  if (res.players) {
    game.players = res.players;
  }
  return game;
}

export async function fetchDraft(): Promise<GameDraft> {
  const res = await fetchJson<BackendDraftResponse>("/api/v1/draft");
  return matchFullToGameDraft(res);
}

export async function fetchDailyDraft(): Promise<GameDraft> {
  const res = await fetchJson<BackendDraftResponse>("/api/v1/draft/daily");
  return matchFullToGameDraft(res);
}

/** Список всех героев (статичный, с фронта). */
export function getHeroes(): Hero[] {
  return HEROES_LIST;
}
