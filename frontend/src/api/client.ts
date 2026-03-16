/**
 * API-клиент. Бэкенд: GET api/v1/draft → массив слотов драфта.
 * Список героев — статичный на фронте (см. data/heroes.ts).
 */

import type {
  GameDraft,
  Hero,
  BackendDraftSlot,
  TeamKind,
  PickBanSlot,
  TeamInfo,
  LeagueInfo,
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
  const matchId = slots[0]?.match_id;
  const sorted = [...slots].sort((a, b) => a.order - b.order);
  const radiant = { bans: [] as number[], picks: [] as number[] };
  const dire = { bans: [] as number[], picks: [] as number[] };
  const picksBans: PickBanSlot[] = [];

  let lastPick: { team: TeamKind; heroId: number; pickIndex: number } | null =
    null;

  for (const s of sorted) {
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

/** Запрос случайной игры (драфт). */
export async function fetchRandomGame(): Promise<GameDraft> {
  const slots = await fetchJson<BackendDraftSlot[]>("/api/v1/draft");
  const game = transformDraftToGame(slots);

  // Получаем информацию о командах и лиге из OpenDota, если есть matchId
  if (game.matchId) {
    try {
      const matchData = await fetchJson<any>(
        `https://api.opendota.com/api/matches/${game.matchId}`,
      );

      // Информация о командах
      if (matchData.radiant_team) {
        game.radiantTeam = {
          teamId: matchData.radiant_team.team_id,
          name: matchData.radiant_team.name,
          tag: matchData.radiant_team.tag,
          logoUrl: matchData.radiant_team.logo_url,
        };
      }

      if (matchData.dire_team) {
        game.direTeam = {
          teamId: matchData.dire_team.team_id,
          name: matchData.dire_team.name,
          tag: matchData.dire_team.tag,
          logoUrl: matchData.dire_team.logo_url,
        };
      }

      // Информация о лиге
      if (matchData.league) {
        game.league = {
          leagueId: matchData.league.leagueid,
          name: matchData.league.name,
          tier: matchData.league.tier,
        };
      }
    } catch (e) {
      console.warn("Failed to fetch match details from OpenDota:", e);
      // Продолжаем работу без данных об командах/лиге
    }
  }

  return game;
}

/** Список всех героев (статичный, с фронта). */
export function getHeroes(): Hero[] {
  return HEROES_LIST;
}
