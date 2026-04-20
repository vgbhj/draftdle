package models

import "time"

type Team struct {
    TeamID  int    `json:"team_id" db:"id"`
    Name    string `json:"name" db:"name"`
    Tag     string `json:"tag" db:"tag"`
    LogoURL string `json:"logo_url" db:"logo_url"`
}

type League struct {
    ID      int64  `json:"id" db:"id"`
    Name    string `json:"name" db:"name"`
    Tier    int    `json:"tier" db:"tier"`
    PatchID int64  `json:"patch_id" db:"patch_id"`
}

type Patch struct {
    ID   int64     `json:"id" db:"id"`
    Name string    `json:"name" db:"name"`
    Date time.Time `json:"date" db:"data"`
}

type Draft struct {
    ID      int64 `json:"id" db:"id"`
    MatchID int64 `json:"match_id" db:"match_id"`
    IsPick  bool  `json:"is_pick" db:"is_pick"`
    HeroID  int   `json:"hero_id" db:"hero_id"`
    Team    int   `json:"team" db:"team"`
    Order   int   `json:"order" db:"order"`
}

type Match struct {
    ID             int64   `json:"id" db:"id"`
    LeagueID       int64   `json:"league_id" db:"league_id"`
    RadiantTeamID  *int    `json:"radiant_team_id" db:"radiant_team_id"`
    DireTeamID     *int    `json:"dire_team_id" db:"dire_team_id"`
    RadiantTeam    *Team   `json:"radiant_team" db:"-"`
    DireTeam       *Team   `json:"dire_team" db:"-"`
    League         *League `json:"league" db:"-"`
}

type MatchFull struct {
    MatchID     int64          `json:"match_id"`
    Slots       []Draft        `json:"slots"`
    RadiantTeam *Team          `json:"radiant_team,omitempty"`
    DireTeam    *Team          `json:"dire_team,omitempty"`
    League      *League        `json:"league,omitempty"`
    Players     map[int]string `json:"players,omitempty"`
}