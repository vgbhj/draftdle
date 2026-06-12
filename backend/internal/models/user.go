package models

type User struct {
	ID        int64  `json:"id" db:"id"`
	TgID      int64  `json:"tg_id" db:"tg_id"`
	Username  string `json:"username" db:"username"`
	FirstName string `json:"first_name" db:"first_name"`
	PhotoURL  string `json:"photo_url" db:"photo_url"`
}
