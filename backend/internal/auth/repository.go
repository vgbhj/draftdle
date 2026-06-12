package auth

import (
	"time"

	"github.com/vgbhj/draftdle/internal/models"
)

type Repository interface {
	UpsertUser(user *models.User) (*models.User, error)
	CreateSession(token string, userID int64, expiresAt time.Time) error
	GetUserBySessionToken(token string) (*models.User, error)
	DeleteSession(token string) error
	DeleteExpiredSessions() error
}
