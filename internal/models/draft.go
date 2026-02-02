package models

type Draft struct {
	ID      int64 `json:"id" db:"id"`
	MatchID int64 `json:"match_id" db:"match_id"`
	IsPick  bool  `json:"is_pick" db:"is_pick"`
	HeroID  int   `json:"hero_id" db:"hero_id"`
	Team    int   `json:"team" db:"team"`
	Order   int   `json:"order" db:"order"`
}
