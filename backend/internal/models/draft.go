package models

import "time"

type Draft struct {
	ID      int64 `json:"id" db:"id"`
	MatchID int64 `json:"match_id" db:"match_id"`
	IsPick  bool  `json:"is_pick" db:"is_pick"`
	HeroID  int   `json:"hero_id" db:"hero_id"`
	Team    int   `json:"team" db:"team"`
	Order   int   `json:"order" db:"order"`
}

type Patch struct {
	ID   int64     `json:"id" db:"id"`
	Name string    `json:"name" db:"name"`
	Date time.Time `json:"date" db:"data"`
}

type League struct {
	ID      int64  `json:"id" db:"id"`
	Name    string `json:"name" db:"name"`
	Tier    int    `json:"tier" db:"tier"`
	PatchID int64  `json:"patch_id" db:"patch_id"`
}

type Match struct {
	ID       int64 `json:"id" db:"id"`
	LeagueID int64 `json:"league_id" db:"league_id"`
}
