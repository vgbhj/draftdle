package auth

import (
	"time"

	"github.com/vgbhj/draftdle/internal/models"
)

// TelegramAuthData is the payload the Telegram Login Widget sends to data-onauth.
type TelegramAuthData struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	PhotoURL  string `json:"photo_url"`
	AuthDate  int64  `json:"auth_date"`
	Hash      string `json:"hash"`
}

type Session struct {
	Token     string
	ExpiresAt time.Time
}

type AuthUC interface {
	LoginTelegram(data TelegramAuthData) (*models.User, *Session, error)
	Logout(token string) error
	Me(token string) (*models.User, error)
}
